'use strict';

var path = require('path'),
    pkgjson = require(path.resolve('./package.json'));

module.exports = {
	app: {
		title: pkgjson.name,
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
		googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID',
		version: pkgjson.version || 'VERSION'
	},
    assets: {
        actions: 'service/actions/**/*.js',
        routes: 'api/routes/**/*.js',
        models: 'models/**/*.js',
        config: 'config/**/*.js',
        apiControllers: 'service/controllers/**/*.js',
        serviceControllers: 'api/controllers/**/*.js',
        tests: {
            service: 'service/tests/**/*.js',
            api: 'api/tests/**/*.js'
        }
    },
    mongo: {
        host: process.env.MONGO_HOST || (process.env.MONGO_HOST_VAR ? process.env[process.env.MONGO_HOST_VAR] : 'localhost')
    },
    redis: {
        host: process.env.REDIS_HOST || (process.env.REDIS_HOST_VAR ? process.env[process.env.REDIS_HOST_VAR] : 'localhost')
    },
    service: {
        host: 'localhost',
        port: 3004
    },
    api: {
        host: 'localhost',
        port: 3000
    }
};
