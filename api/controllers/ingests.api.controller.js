'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Ingest = mongoose.model('Ingest'),
    IngestLog = mongoose.model('IngestLog');

var _ = require('lodash');
var path = require('path');    
var thenify = require('thenify');
    
var rsmq = require(path.resolve('./config/lib/rsmq')).queue;

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
			return res.status(400).send({
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
			return res.status(400).send({
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
			return res.status(400).send({
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
			    return res.status(400).send({
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

    var ingestLog = new IngestLog({ 
        ingest: req.ingest._id, 
        status: 'running' 
    });
    
    var send = thenify(rsmq.send);
    
    ingestLog
        .save()
        .then((doc) => {
            return send(JSON.stringify({
                action: 'ingester.run',  
                ingestId: req.ingest._id,
                ingestLogId: doc._id,
                limit: req.query.limit
            }));
        })
        .then(() => {
            res.jsonp({
                ingestLog: ingestLog._id,
                status: 'accepted'
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).jsonp({
                status: err
            });
        });
};
