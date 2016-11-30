'use strict';

var jsdom = require('jsdom'),
    swig = require('swig'),
    request = require('request'),
    _ = require('lodash');

var thenify = require('thenify');
var assert = require('assert');

var mongoose = require('mongoose'),
	Product = mongoose.model('Product'),
	IngestLog = mongoose.model('IngestLog');
	
var debug = require('debug')('scraper');

function runSelectors(product, selectors, html) {
    return new Promise((resolve, reject) => {
	    // This is the only place we use the modules and they don't release memory
	    // http://stackoverflow.com/questions/13893163/jsdom-and-node-js-leaking-memory
	    // This is essentially a worker function so we don't care about speed really
        jsdom.env({
            html: html,
            done: function(err,window) {
                if (err) { return reject(err); }
                
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
                        //console.log('%s = "%s"',k,product[k]);
                    });
                    
                resolve();
            }
        });
    });
}

function searchAndScrapeExternal(args) {
    var product = args.product = args.product || {};
    
    var swigOpts = {
        locals: {
            supplierCode: product.supplierCode
        }
    };
    
    var get = thenify(request.get);
    
    return new Promise(
        (resolve, reject) => {
            if (!args.searchUrlTemplate) { return reject('searchUrlTemplate not defined'); }
            resolve(product.externalUrl);
        })
        .then((link) => {
            if (link) { return link; }
            return get(swig.render(args.searchUrlTemplate, swigOpts))
                .then((res) => {
                    return runSelectors(product, args.searchSelectors, res[1]);
                })
                .then(() => {
                    return product.externalUrl;
                });
        })
        .then((link) => {
            assert.ok(link, 'product not found on site: ' + product.supplierCode);
            return get(link);
        })
        .then((res) => {
            return runSelectors(product, args.productSelectors, res[1]);
        })
        .catch((err) => { throw new Error('searchAndScrape error:' + err); });
    
}

function logCount(ingestLogId,count) {

    if (count % 10) { return Promise.resolve(); }
    return IngestLog
        .findById(ingestLogId)
        .exec()
        .then((ingestLog) => {
            assert.ok(ingestLog, 'ingestLog not found: ' + ingestLogId);
            return ingestLog.log('scraped ' + count + ' so far...');
        });
        
}

/*
 * record
 * supplierCode
 * searchUrlTemplate
 * searchSelectors
 * productSelectors
 */

exports.scrape = function(args, done) {

    if (process.memoryUsage().heapUsed > 250e6) {
        console.error('process should exit:', process.memoryUsage());
        //process.exit(0);
    }
    
    Product
        .findOne({supplierCode: args.supplierCode, supplier: args.supplierId})
        .then((product) => {
            assert.ok(product, 'Product not found: ' + args.supplierCode);
        
            args.product = product;
            
            return searchAndScrapeExternal(args);
        })
        .then(() => { return args.product.save(); })
        .then(() => { return logCount(args.ingestLogId,args.count); })
        .then(() => { done(); })
        .catch(done);

};
