'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Ingest = mongoose.model('Ingest'),
    IngestLog = mongoose.model('IngestLog'),
    Product = mongoose.model('Product'),
    request = require('request'),
    yaml = require('yaml-js'),
    csv = require('csv'),
    _ = require('lodash'),
    async = require('async');

var debug = require('debug')('ingester');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'ingest already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};


function securityFormPost(context,callback) {
    var ingest = context.ingest;
    if (ingest.securityType !== 'formPost') { return callback(null, context); }
    
    context.log('authenticating');
    
    var payload = yaml.load(ingest.formPostPayload);
    
    request
        .defaults({jar: request.jar()})
        .post(
            ingest.formPostUrl,
            { form: payload }, 
            function(err,httpResponse,body){
                callback(err, context);
            }
        );
}

function extendProduct(product, fieldMap, record) {
    var values = {};

    _(fieldMap)
        .keys()
        .forEach(function(k) {
            if (k === 'tags') {
                if (product) {
                    values[k] = _.union(product.tags, [record[fieldMap[k]]]);
                } else {
                    values[k] = [record[fieldMap[k]]];
                }
            }
            else {
                values[k] = record[fieldMap[k]];
            }
        });
    
    debug(values);
    
    if (product) {
        product = _.extend(product, values);
    }
    else {
        product = new Product(values);
    }
    
    return product;
}

function getProductAndExtend(args,record, callback) {
    Product.findOne(
        {supplierCode: args.supplierCode, supplier: args.supplierId}, 
        function(err, product) {
            if (err) { return callback(err); }
            
            product = extendProduct(product, args.fieldMap, record);
            
            if (! product.supplier) {
                product.supplier = args.supplierId;
            }
    
            product.save(function(_err) {
                if (_err) { return callback(_err); }
                args.seneca.act({role: 'products', cmd: 'scrape', record: record});
                return callback();
            });
        }
    );
}

function csvParser(context, callback) {
    var ingest = context.ingest;
    var fieldMap = context.fieldMap;
    
    if (!ingest.fieldMap) {
        debug('no fieldMap for ingest, skipping csv parser');
        return callback(null, context); 
    }
    
    context.log('configuring csv parser');
    
    var parser = csv.parse({delimiter: ',', trim: true, columns: true, relax: true});
                
    parser.on('readable', function(){
        var record;
        
        async.whilst(
            function(n) {
                if (context.limit && (context.limit > context.count)) {
                    return true; 
                }
                record = parser.read();
                if (record) { return true; }
                return false;
            },
            function(cb) {
                debug('to extend', record);
                getProductAndExtend(context,record,function(err) {
                    if (err) {
                        context.log('Product error: %s', err);
                    }
                    context.count++;
                    cb(null,context.count);
                });
            }
        );
        
    });
    
    parser.on('error', function(_err){
        // record ingest status
        context.log('csv parser error: %s', _err);
    });
    
    parser.on('finish', function(){
        // record ingest status
        context.totalrecords = context.count;
        context.log('csv parsing complete %s records processed', context.count);
        
        // we don't need this any more and it creates leaks by holding bags of references
        context.parser = null;
    });
    
    context.parser = parser;
    callback(null,context);
}

function streamAndParse(context, callback) {
    var ingest = context.ingest;
    
    if (!ingest.downloadUrl) {
        return callback('no downloadUrl',context); 
    }
    
    if (!context.parser) {
        return callback('no parser defined',context);
    }

    context.log('stream file and parse it');

    debug(ingest.downloadUrl);
    
    request
        .defaults({jar: request.jar()})
        .get(ingest.downloadUrl)
        .on('finish',_.partial(callback,null,context))
        .on('error',_.partial(callback,_,context))
        .pipe(context.parser);
}

function startLog(context, callback) {
    
    var ingestLog = new IngestLog({ 
        ingest: context.ingest._id, 
        status: 'running' 
    });
    
    context.ingestLog = ingestLog;
    context.ingestLogId = ingestLog._id;
    
    context.log = function() { 
        ingestLog.log.apply(ingestLog,arguments); 
    };
    
    context.finish = function(err) { ingestLog.finish(err); };
    
    context.ingestLog.save(function(err) {
        callback(err,context);
    });
}

function makeContext(args,callback) {
    Ingest.findById(args.ingestId)
        //.populate('user', 'displayName')
        //.populate('supplier', 'name')
        .exec(function(err, ingest) {
	        if (err) { return callback(err); }
	        if (! ingest) { return callback(
	            new Error('Failed to load ingest ' + args.ingestId)
	        ); }
	        
	        debug(ingest);

            var fieldMap = yaml.load(ingest.fieldMap);
            var searchSelectors = yaml.load(ingest.searchSelectors);
            var productSelectors = yaml.load(ingest.productSelectors);
            
            var context = {
                ingest: ingest, 
                fieldMap: fieldMap,
                searchSelectors: searchSelectors,
                productSelectors: productSelectors,
                limit: args.limit,
                count: 0,
                totalitems: 0,
                processed: 0
            };
	        
	        startLog(context,callback);
        });
}

exports.ingest = function(args,done) {
    var seneca = this;
    
    makeContext(args, function(err,context) {
        if (err) { return done(err); }
    
        context.seneca = seneca;

        async.waterfall([
            _.partial(securityFormPost,context),
            csvParser,
            streamAndParse
        ], function (err) {
            context.finish(err);
        });
        
        // Accept the request, while the ingest carries on in the background
        done(null, {
            status: 'accepted',
            ingestLogId: context.ingestLogId
        });
        
    });

};
