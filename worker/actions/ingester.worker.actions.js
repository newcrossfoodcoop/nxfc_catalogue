'use strict';

/**
 * Module dependencies.
 */

var ingester = require('../controllers/ingester.worker.controller');
var path = require('path');
var config = require(path.resolve('./config/config'));

module.exports = function() {
    var seneca = this;
    
    seneca
        .add({role: 'ingester', cmd: 'run'}, ingester.ingest)
        .client({type: 'redis-queue', pin: {role: 'scraper', cmd: 'scrape'}})
        .listen({ pin: {role: 'ingester', cmd: 'run'}});
    
    // Start the app by listening on <port>
	var port = config.worker.port;
	seneca.listen(port);

	// Logging initialization
	console.log('Started on port ' + port);
    
};
