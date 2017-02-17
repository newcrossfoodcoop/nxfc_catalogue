'use strict';

/**
 * Module dependencies.
 */
 
var path = require('path');

var config = require(path.resolve('./config/config'));
var scraper = require('../controllers/scraper.worker.controller');
var ingester = require('../controllers/ingester.worker.controller');

module.exports = function(worker) {
    worker.on('message', function( message, next, id ){
        var _data = JSON.parse( message );
        
        console.log(_data);
        
        switch(_data.action) {
            case 'ingester.run':
                ingester.ingest(_data, next, id);
                break;
            case 'scraper.scrape':
                scraper.scrape(_data, next, id);
                break;
            case 'ingester.complete':
                ingester.complete(_data, next, id);
                break;
            case 'ingester.fail':
                ingester.fail(_data, next, id);
                break;
            default:
                next(new Error('unrecognised action: ' + _data.action));
        }
    });
};
