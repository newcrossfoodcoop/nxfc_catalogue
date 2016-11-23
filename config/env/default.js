'use strict';

var path = require('path'),
    pkgjson = require(path.resolve('./package.json'));

module.exports = {
	app: {
	    app: 'unknown',
		title: pkgjson.name,
		description: 'NXFC Catalogue Services',
		keywords: 'mongodb, express, node.js, mongoose, seneca',
		version: pkgjson.version || 'VERSION'
	},
    assets: {
        actions: 'worker/actions/**/*.js',
        routes: 'api/routes/**/*.js',
        models: 'models/*.js',
        config: 'config/**/*.js',
        workerControllers: 'worker/controllers/**/*.js',
        apiControllers: 'api/controllers/**/*.js',
        raml: 'api/raml/*.raml',
        tests: {
            worker: 'worker/tests/**/*.js',
            api: 'api/tests/**/*.js',
            model: 'models/tests/**/*.js'
        }
    },
    mongo: {
        host: process.env.MONGO_HOST || (process.env.MONGO_HOST_VAR ? process.env[process.env.MONGO_HOST_VAR] : 'localhost')
    },
    redis: {
        host: process.env.REDIS_HOST || (process.env.REDIS_HOST_VAR ? process.env[process.env.REDIS_HOST_VAR] : 'localhost')
    },
    worker: {
        host: process.env.WORKER_HOST || (process.env.WORKER_HOST_VAR ? process.env[process.env.WORKER_HOST_VAR] : 'localhost'),
        port: 3014
    },
    api: {
        host: 'localhost',
        port: 3010
    }
};
