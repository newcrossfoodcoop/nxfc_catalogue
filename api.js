'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	mongoose = require('./config/lib/mongoose'),
	express = require('./config/lib/express'),
	rsmq = require('./config/lib/rsmq');

config.app.app = 'api';

// Initialize mongoose
mongoose.connect(function (db) {

    // initialise redis queue
    var queue = rsmq.initSupplier();

	// Initialize express
	var app = express.init(db);

	// Start the app by listening on <port>
	var port = config.api.port;
	app.listen(port);

	// Logging initialization
	console.log('Started on port ' + port);
});
