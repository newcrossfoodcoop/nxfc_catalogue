'use strict';

/**
 * Module dependencies.
 */

var scraper = require('../controllers/scraper.service.controller');

module.exports = function(options) {
    var seneca = this;
    
    seneca
        .add({role: 'products', cmd: 'scrape'}, scraper.scrape)
        .client({type: 'redis-queue', pin: {role: 'products', cmd: 'scrape'}})
        .listen({type: 'redis-queue', pin: {role: 'products', cmd: 'scrape'}});
    
};
