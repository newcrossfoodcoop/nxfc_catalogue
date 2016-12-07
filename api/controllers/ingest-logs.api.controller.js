'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	IngestLog = mongoose.model('IngestLog'),
	IngestLogEntry = mongoose.model('IngestLogEntry');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'ingest already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Show the current ingest log
 */
exports.read = function(req, res) {
	res.jsonp(req.ingestLog);
};

/**
 * List of ingest logs
 */
exports.list = function(req, res) {
    var ingest = req.ingest;
    IngestLog.find({ingest: ingest._id}).sort('-created')
        //.populate('user', 'displayName')
        .limit( req.query.limit || 5)
        .exec(function(err, ingestLogs) {
		    if (err) {
			    return res.status(400).send({
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(ingestLogs);
		    }
	    });
};

/**
 * List of ingest log entries
 */
exports.listEntries = function(req, res) {
    IngestLogEntry.find({ingestLog: req.ingestLog._id}).sort('date')
        .exec(function(err, ingestLogEntries) {
		    if (err) {
			    return res.status(400).send({
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(ingestLogEntries);
		    }
	    });
};

/**
 * ingest logs middleware
 */
exports.ingestLogByID = function(req, res, next, id) { 
    IngestLog.findById(id)
        //.populate('user', 'displayName')
        //.populate('ingest', 'name')
        .exec(function(err, ingestLog) {
		    if (err) return next(err);
		    if (! ingestLog) return next(new Error('Failed to load ingestLog ' + id));
		    req.ingestLog = ingestLog ;
		    next();
	    });
};

