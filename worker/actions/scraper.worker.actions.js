'use strict';

/**
 * Module dependencies.
 */

var scraper = require('../controllers/scraper.worker.controller');

module.exports = function(options) {
    var seneca = this;
    
    seneca
        .add({role: 'scraper', cmd: 'scrape'}, scraper.scrape)
        .listen({type: 'redis-queue', pin: {role: 'scraper', cmd: 'scrape'}});
    
};
