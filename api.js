'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	mongoose = require('./config/lib/mongoose'),
	express = require('./config/lib/express'),
	seneca = require('./config/lib/seneca');

// Initialize mongoose
mongoose.connect(function (db) {
	// Initialize express
	var app = express.init(db);
    app.locals.seneca = seneca.initForApi();

	// Start the app by listening on <port>
	var port = config.api.port || 3000;
	app.listen(port);

	// Logging initialization
	console.log('Started on port ' + port);
});
