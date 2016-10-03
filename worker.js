'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	mongoose = require('./config/lib/mongoose'),
	seneca = require('./config/lib/seneca');

config.app.app = 'service';

// Initialize mongoose
mongoose.connect(function (db) {
	// Initialize seneca
	var app = seneca.init(db);

	// Start the app by listening on <port>
	var port = config.worker.port;
	app.listen(port);

	// Logging initialization
	console.log('Started on port ' + port);
});
