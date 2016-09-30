'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	chalk = require('chalk'),
	path = require('path'),
	_ = require('lodash'),
	mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function() {
	// Globbing model files
	config.files.models.forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});
};

// Initialize Mongoose
module.exports.connect = function(cb) {
	var _this = this;

	var db = mongoose.connect(config.mongo.uri, function (err) {
		// Log Error
		if (err) {
			console.error(chalk.red('Could not connect to MongoDB!'));
			console.log('tried: "%s"\n  got: "%s"',config.mongo.uri, err);
			console.log('Maybe you need to set MONGO_HOST_VAR to one of these:');
			_(process.env)
			    .pick(function(v,k) { return k.match( /pass/i ) ? false : k.match( /mongo/i ); })
			    .toPairs()
			    .forEach(function(p) { console.log('   ',p); });
		} else {
			// Load modules
			_this.loadModels();

			// Call callback FN
			if (cb) cb(db);
		}
	});
};

module.exports.disconnect = function(cb) {
  mongoose.disconnect(function(err) {
  	console.info(chalk.yellow('Disconnected from MongoDB.'));
  	cb(err);
  });
};
