'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    mongooseVersion = require('mongoose-version'),
	Schema = mongoose.Schema;

var ProductOptionSchema = new Schema({
    name: String,
    values: [ String ]
});

/**
 * Product Schema
 * A product can be a 'case'
 */
var ProductSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Product name',
		trim: true
	},
	description: {
	    type: String,
	    default: '',
	    trim: true
	},
	annotation: {
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
	    ref: 'Supplier'
	},
	brand: String,
	caseRRP: Number,
	unitRRP: Number,
	supplierPrice: Number,
	supplierCode: String,
	supplierKey: String,
	unitsPerCase: Number,
	unitSize: String,
	caseSize: String,
	mainImageUrl: String,
	thumbImageUrl: String,
	externalUrl: String,
	VATcode: Number,
	FGOSV: String,
	unitBarcode: Number, 
	caseBarcode: Number,
	tags: [{
	    type: String,
	    required: 'A tag cannot be empty'
	}]
});

ProductSchema.plugin(mongooseVersion,{collection: 'product_history', strategy: 'collection'});

ProductSchema.virtual('price').get(function () {
    return this.supplierPrice;
});

ProductSchema.virtual('size').get(function () {
    return this.caseSize;
});

ProductSchema.set('toJSON', { getters: true });
ProductSchema.set('toObject', { getters: true });

ProductSchema.index({ name: 'text', supplierCode: 'text', description: 'text', tags: 'text', brand: 'text', supplier: 'text' });

mongoose.model('Product', ProductSchema);
