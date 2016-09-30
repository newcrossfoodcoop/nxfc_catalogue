'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Ingest = mongoose.model('Ingest'),
    _ = require('lodash'),
    path = require('path');

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
 * Create a ingest
 */
exports.create = function(req, res) {
	var ingest = new Ingest(req.body);
	//ingest.user = req.user;

	ingest.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(ingest);
		}
	});
};

/**
 * Show the current ingest
 */
exports.read = function(req, res) {
	res.jsonp(req.ingest);
};

/**
 * Update a ingest
 */
exports.update = function(req, res) {
	var ingest = req.ingest ;

	ingest = _.extend(ingest , req.body);

	ingest.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(ingest);
		}
	});
};

/**
 * Delete an ingest
 */
exports.delete = function(req, res) {
	var ingest = req.ingest ;

	ingest.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(ingest);
		}
	});
};

/**
 * List of ingests
 */
exports.list = function(req, res) { 
    Ingest.find().sort('-created')
        //.populate('user', 'displayName')
        .exec(function(err, ingests) {
		    if (err) {
			    return res.send(400, {
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(ingests);
		    }
	    });
    };

/**
 * ingest middleware
 */
exports.ingestByID = function(req, res, next, id) { 
    Ingest.findById(id)
        //.populate('user', 'displayName')
        .populate('supplier', 'name')
        .exec(function(err, ingest) {
		    if (err) return next(err);
		    if (! ingest) return next(new Error('Failed to load ingest ' + id));
		    req.ingest = ingest ;
		    next();
	    });
};

exports.run = function(req, res, next) {
    var seneca = req.app.locals.seneca;
    seneca.act({
        role: 'ingest', 
        cmd: 'run', 
        ingestId: req.ingest._id, 
        limit: req.query.limit
    }, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).jsonp({
                status: err
            });
        } else {
            res.jsonp({
                ingestLog: result.ingestLogId,
                status: 'accepted'
            });
        }
    });
};
