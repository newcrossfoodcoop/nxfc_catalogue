'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
    path = require('path'),
    seneca = require('seneca');

exports.initTransports = function(_seneca) {
    return _seneca
        .use('redis-queue-transport', {
            'redis-queue': {
                host: config.redis.host,
                port: 6379,
                topic: 'seneca_' + process.env.NODE_ENV
            }
        });
};

/**
 * Initialize the Seneca application
 */
module.exports.init = function () {
    // Creates a new seneca instance for each action group
	config.files.actions.forEach(function (actionPath) {
	    exports.initTransports(seneca())
		    .use(path.resolve(actionPath));
	});

};

module.exports.initForApi = function () {
    return seneca().client({
        port: config.worker.port, 
        host: config.worker.host, 
        role: 'ingester'
    });
};
