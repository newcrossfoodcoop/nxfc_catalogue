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

var path = require('path');
var assert = require('assert');
var thenify = require('thenify');

var rsmq = require(path.resolve('./config/lib/rsmq')).queue;

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


function securityFormPost(context) {
    var ingest = context.ingest;
    if (ingest.securityType !== 'formPost') { return Promise.resolve(); }
    
    context.log('authenticating');
    
    var payload = yaml.load(ingest.formPostPayload);
    
    var post = thenify(request.defaults({jar: request.jar()}).post);

    return post(ingest.formPostUrl,{ form: payload });
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

function getProductAndExtend(context,record, count, callback) {
    var supplierCode = record[context.fieldMap.supplierCode];
    
    Product.findOne(
        {supplierCode: supplierCode, supplier: context.supplierId}, 
        function(err, product) {
            if (err) { return callback(err); }
            if (!product) { console.log('Product not found: ' + supplierCode + ' - ' + context.supplierId); }
            
            product = extendProduct(product, context.fieldMap, record);
            
            if (! product.supplier) {
                product.supplier = context.supplierId;
            }
    
            product.save(function(_err) {
                if (_err) { return callback(_err); }
                if (product.externalUrl && !context.scrapeAll) { return callback(); }
                // start scrape off
                rsmq.send(JSON.stringify({
                    action: 'scraper.scrape',
                    count: count,
                    ingestLogId: context.ingestLogId,
                    supplierId: context.supplierId,
                    supplierCode: supplierCode,
                    searchSelectors: context.searchSelectors,
                    productSelectors: context.productSelectors,
                    searchUrlTemplate: context.ingest.searchUrlTemplate
                }), callback);
            });
        }
    );
}

function transformer(context) {

    return function (record, callback) {
        if (context.limit && (context.limit <= context.count)) { return callback(); }
        context.count++;
        debug('to extend', record);
        getProductAndExtend(context,record, context.count, function(err) {
            if (err) { context.log('Product error: %s', err); }
            callback();
        });
    };

}

function streamAndParse(context) {
    var ingest = context.ingest;
    
    if (!ingest.downloadUrl) {
        return Promise.reject('no downloadUrl');
    }

    context.log('stream file and parse it');

    debug(ingest.downloadUrl);
    
    return new Promise((resolve, reject) => {
        var stream = request
            .defaults({jar: request.jar()})
            .get(ingest.downloadUrl)
            .pipe(csv.parse({delimiter: ',', trim: true, columns: true, relax: true, relax_column_count: true}))
            .pipe(csv.transform(transformer(context)));
    
        stream
            .on('finish',() => { resolve(); })
            .on('error',reject);
    });
}

function startLogging(context) {
    
    return IngestLog
        .findById(context.ingestLogId)
        .exec()
        .then((ingestLog) => {
            assert.ok(ingestLog);
            context.ingestLog = ingestLog;
            context.log = function() { 
                ingestLog.log.apply(ingestLog,arguments); 
            };
            context.finish = function(err) { ingestLog.finish(err); };
        });
        
}

function makeContext(args) {
    return Ingest.findById(args.ingestId)
        //.populate('user', 'displayName')
        //.populate('supplier', 'name')
        .exec()
        .then((ingest) => {
            assert.ok(ingest, 'ingest not found: ' + args.ingestId);
            assert.ok(ingest.fieldMap, 'ingest has no fieldMap: ' + args.ingestId);
      
	        debug(ingest);

            var fieldMap = yaml.load(ingest.fieldMap);
            var searchSelectors = yaml.load(ingest.searchSelectors);
            var productSelectors = yaml.load(ingest.productSelectors);
            
            var context = {
                ingest: ingest,
                ingestLogId: args.ingestLogId,
                fieldMap: fieldMap,
                searchSelectors: searchSelectors,
                productSelectors: productSelectors,
                supplierId: ingest.supplier,
                limit: args.limit,
                count: 0
            };
	        
	        return context;
        });
}

exports.ingest = function(args,done) {

    console.log('Starting ingest');
    var context;
    makeContext(args)
        .then((_context) => {
            context = _context;
            return startLogging(context);
        })
        .then(() => {
            context.log('start logging');
            return securityFormPost(context);
        })
        .then(() => {
            return streamAndParse(context);
        })
        .then(() => {
            context.log('queue complete item');
            return rsmq.send(JSON.stringify({
                action: 'ingester.complete',
                count: context.count,
                ingestLogId: context.ingestLogId
            }));
        })
        .then(() => { done(); })
        .catch((err) => {
            context.log('queue fail item');
            rsmq.send(JSON.stringify({
                action: 'ingester.fail',
                count: context.count,
                ingestLogId: context.ingestLogId,
                err: err
            }));
            done(err);
        });

};

exports.complete = function(args,done) {
    var context = {
        ingestLogId: args.ingestLogId  
    };
    
    startLogging(context)
        .then(() => {
            context.log('total records processed: ' + args.count);
            context.finish(); 
        })
        .then(() => { done(); })
        .catch(done);
};

exports.fail = function(args,done) {
    var context = {
        ingestLogId: args.ingestLogId  
    };

    startLogging(context)
        .then(() => {
            context.log('processed ' + args.count + ' records');
            context.finish(args.err); 
        })
        .then(() => { done(); })
        .catch(done);
};
