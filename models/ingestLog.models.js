'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema, 
	util = require('util');

var ingestLogEntrySchema = new Schema({
    ingestLog: {
        type: Schema.ObjectId,
		ref: 'IngestLog',
		required: 'An ingest log entry must be associated with an ingest'
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    message: String
});

var IngestLogEntry = mongoose.model('IngestLogEntry', ingestLogEntrySchema);

/**
 * ingest log Schema
 */
var ingestLogSchema = new Schema({
    ingest: {
		type: Schema.ObjectId,
		ref: 'Ingest',
		required: 'An ingest log must be associated with an ingest'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	updated: {
	    type: Date,
	    default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	},
	status: {
	    type: String,
	    enum: ['new', 'running', 'success', 'fail'],
	    default: 'new',
	    required: 'ingest log must have a status'
	}
});

ingestLogSchema.methods.log = function() {

    var message = util.format.apply(null,arguments);
    var entry = new IngestLogEntry({
        message: message,
        ingestLog: this._id
    });
    
    entry.save(function(err) {
        if (err) {
            console.log('failed to save log entry: "%s" because: %s', message, err);
        }
    });
    
    console.log('INGEST LOG:', message);
    return message;
};

ingestLogSchema.methods.finish = function(err) {
    if (err) {
        this.status = 'fail';
        this.log('finished with error: %s', err);
    }
    else {
        this.status = 'success';
        this.log('finished');
    }
    this.save(function(err) {
        if (err) {
            console.error('failed to save the log: ', err);
        }
    });
};

mongoose.model('IngestLog', ingestLogSchema);
