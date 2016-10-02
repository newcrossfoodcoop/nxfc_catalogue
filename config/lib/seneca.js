'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
    path = require('path'),
    seneca = require('seneca')();

exports.initActions = function() {
	config.files.actions.forEach(function (actionPath) {
		seneca.use(path.resolve(actionPath));
	});
};

exports.initClient = function() {
    seneca.client({
        port: config.worker.port, 
        host: config.worker.host, 
        role: 'ingest'
    });
};

exports.initTransports = function() {
    seneca
        .use('redis-queue-transport', {
            'redis-queue': {
                host: config.redis.host,
                port: 6379
            }
        });
};

/**
 * Initialize the Seneca application
 */
module.exports.init = function () {
    this.initTransports();

    this.initActions();
    
    return seneca;
};

module.exports.initForApi = function () {
    this.initClient();
    
    return seneca;
};
