'use strict';

var path = require('path'),
    pkgjson = require(path.resolve('./package.json'));

module.exports = {
	app: {
	    app: 'unknown',
		title: pkgjson.name,
		description: 'NXFC Products Services',
		keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
		version: pkgjson.version || 'VERSION'
	},
    assets: {
        actions: 'worker/actions/**/*.js',
        routes: 'api/routes/**/*.js',
        models: 'models/**/*.js',
        config: 'config/**/*.js',
        workerControllers: 'worker/controllers/**/*.js',
        apiControllers: 'api/controllers/**/*.js',
        tests: {
            worker: 'worker/tests/**/*.js',
            api: 'api/tests/**/*.js'
        }
    },
    mongo: {
        host: process.env.MONGO_HOST || (process.env.MONGO_HOST_VAR ? process.env[process.env.MONGO_HOST_VAR] : 'localhost')
    },
    redis: {
        host: process.env.REDIS_HOST || (process.env.REDIS_HOST_VAR ? process.env[process.env.REDIS_HOST_VAR] : 'localhost')
    },
    worker: {
        host: 'localhost',
        port: 3014
    },
    api: {
        host: 'localhost',
        port: 3010
    }
};
