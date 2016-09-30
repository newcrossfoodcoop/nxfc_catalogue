'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * supplier Schema
 */
var supplierSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill supplier name',
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
	}
});

mongoose.model('Supplier', supplierSchema);
