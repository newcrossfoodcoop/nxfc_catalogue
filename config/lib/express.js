'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	path = require('path');

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.config = config;

	// Passing the request url to environment locals
	app.use(function (req, res, next) {
		res.locals.host = req.protocol + '://' + req.hostname;
		res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
		next();
	});
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
	// Showing stack errors
	app.set('showStackError', true);

	// Enable jsonp
	app.enable('jsonp callback');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
};

/**
 * Configure the modules server routes
 */
module.exports.initApiRoutes = function (app) {
	// Globbing routing files
	config.files.routes.forEach(function (routePath) {
		require(path.resolve(routePath))(app);
	});
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function (err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Redirect to error page
		res.status(500).send();
	});

	// Assume 404 since no middleware responded
	app.use(function (req, res) {
		// Redirect to not found page
		res.status(404).send();
	});
};

/**
 * Configure the static routes
 */
module.exports.initStaticRoutes = function (app) {
	// Setting the app router and static folder
	app.use('/', express.static(path.resolve('./public')));
	app.use('/', express.static(path.resolve('./api/raml')));
	app.use('/', express.static(path.resolve('./api/build'),{index: 'api.html'}));
};

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
	// Initialize express app
	var app = express();

	// Initialize local variables
	this.initLocalVariables(app);

	// Initialize Express middleware
	this.initMiddleware(app);
	
	// Initalized static routes
	this.initStaticRoutes(app);

	// Initialize api server routes
	this.initApiRoutes(app);

	// Initialize error routes
	this.initErrorRoutes(app);

	return app;
};
