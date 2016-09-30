'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	mongoose = require('./config/lib/mongoose'),
	seneca = require('./config/lib/seneca');

// Initialize mongoose
mongoose.connect(function (db) {
	// Initialize seneca
	var app = seneca.init(db);

	// Start the app by listening on <port>
	var port = config.service.port || 3004;
	app.listen(port);

	// Logging initialization
	console.log('Started on port ' + port);
});
