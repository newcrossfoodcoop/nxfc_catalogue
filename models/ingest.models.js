'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * ingest Schema
 */
var ingestSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill ingest name',
		trim: true
	},
	description: {
	    type: String,
	    default: '',
	    trim: true
	},
	updated: {
	    type: Date,
	    default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	supplier: {
	    type: Schema.ObjectId,
	    ref: 'Supplier',
	    required: 'An ingest must be assosicated with a supplier'
	},
    searchUrlTemplate: String,
	downloadUrl: String,
	formPostUrl: String,
    formPostPayload: String,
    searchSelectors: String,
    productSelectors: String,
	securityType: {
	    type: String,
	    enum: ['formPost', 'none'],
	    default: 'none'
	},
	fieldMap: {
	    type: String
	}
});

mongoose.model('Ingest', ingestSchema);
