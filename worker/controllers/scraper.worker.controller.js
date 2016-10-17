'use strict';

var async = require('async'),
    jsdom = require('jsdom'),
//    jquery = require('jquery'),
    swig = require('swig'),
    request = require('request'),
    _ = require('lodash');

var mongoose = require('mongoose'),
	Product = mongoose.model('Product');
	
var debug = require('debug')('scraper');

function _runSelectors(product, selectors, html, callback) {

	// This is the only place we use the modules and they don't release memory
	// http://stackoverflow.com/questions/13893163/jsdom-and-node-js-leaking-memory
	// This is essentially a worker function so we don't care about speed really
    jsdom.env({
        html: html,
        done: function(err,window) {
            var $ = require('jquery')(window);
            
            _(selectors)
                .keys()
                .forEach(function(k) {
                    if (k.match(/imageurl$/i)) {
                        product[k] = $(html).find(selectors[k]).attr('src');
                    } else if (k.match(/url$/i)) {
                        product[k] = $(html).find(selectors[k]).attr('href');
                    } else {
                        product[k] = $(html).find(selectors[k]).html();
                    }
                    console.log('%s = "%s"',k,product[k]);
                });
                
            callback();
        }
    });
}

function searchAndScrapeExternal(args, callback) {
    var product = args.product = args.product || {};
    
    if (!args.searchUrlTemplate) { return callback('searchUrlTemplate not defined'); }
    
    var swigOpts = {
        locals: {
            supplierCode: product.supplierCode
        }
    };
    
    async.waterfall([
        function(_callback) {
            if (product.externalUrl) { return _callback(null, product.externalUrl); }
            request.get(
                swig.render(args.searchUrlTemplate, swigOpts),
                function(err,res,body) {
                    if (err) { return _callback(err); }
                    _runSelectors(product, args.searchSelectors, body, function() {
                        _callback(null, product.externalUrl);
                    });
                }
            );
        },
        function(link,_callback) {
            if (!link) { return _callback('product not found'); }
            request.get(
                link, 
                function(err,res,body) {
                    if (err) { return _callback(err); }
                    _runSelectors(product, args.productSelectors, body, _callback);
                }
            );
        }
    ], function(err) {
        var result = null;
        if (err) { result = 'searchAndScrape error:' + err; }
        callback(result, args);
    });
}

/*
 * record
 * supplierCode
 * searchUrlTemplate
 * searchSelectors
 * productSelectors
 */

exports.scrape = function(_args, _done) {
    debug('hello');
    
    var args = _args.args;
    var done = function(err) {
        if (err) {
            console.error(err);
        }
        _done();
    };
    
    console.log(args);
    
    //done(null, {foo: 'bar'});

    Product.findOne(
        {supplierCode: args.supplierCode, supplier: args.supplierId}, 
        function(err, product) {
            if (err) { return done(err); }
            if (!product) { return done('Product not found: ' + args.supplierCode); }
            
            //console.log('product retrieved:', product._id);
            
            args.product = product;
            
            searchAndScrapeExternal(args, function(_err) {
//                if (_err) { context.ingestLog.log('queue item error: %s', _err); }
                if (_err) { console.log('queue item error: %s', _err); }
                product.save(function(__err) {
                    if (__err) { return done(__err); }
//                    context.processed++;
                    return done();
                });
            });
        }
    );

    if (process.memoryUsage().heapUsed > 100e6) {
        console.error('process should exit:', process.memoryUsage());
        //process.exit(0);
    }

};
