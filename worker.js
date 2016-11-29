'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	mongoose = require('./config/lib/mongoose'),
	rsmq = require('./config/lib/rsmq');

config.app.app = 'service';

// Initialize mongoose
mongoose.connect(function (db) {
	// Initialize seneca
	var app = rsmq.initWorker();

});
