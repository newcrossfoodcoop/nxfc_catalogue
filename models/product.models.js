'use strict';

var util = require('util');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    mongooseVersion = require('mongoose-version'),
	Schema = mongoose.Schema;

var path = require('path');
var config = require(path.resolve('./config/config'));

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
		required: true,
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
	    ref: 'Supplier',
	    required: true
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
	    required: true
	}],
	categories: [{
	    type: String,
	    required: true
	}],
	published: {
	    type: Boolean,
	    required: true,
	    default: true
	}
});

ProductSchema.plugin(mongooseVersion,{collection: 'product_history', strategy: 'collection'});

// TODO: move other vat rates to config
ProductSchema.virtual('vatRate').get(function() {
    var product = this;

    if (!product.VATcode) { return 0; }
    
    switch (product.VATcode) {
        case 1:
            return config.pricing.vatRate;
        case 2:
            return 0.12;
        case 5:
            return 0.05;
    }
    
    throw new Error(util.format('Unrecognised VATcode: %s', product.VATcode));
});

ProductSchema.virtual('marginRate').get(() => { return config.pricing.marginRate; });

ProductSchema.virtual('supplierVat').get(function() {
    var product = this;
    return Number((product.supplierPrice * product.vatRate).toFixed(2));
});

ProductSchema.virtual('vat').get(function() {
    var product = this;
    return Number(((product.supplierPrice + product.margin) * product.vatRate).toFixed(2));
});

ProductSchema.virtual('marginVat').get(function() {
    var product = this;
    return product.vat - product.supplierVat;
});

ProductSchema.virtual('margin').get(function () {
    return Number((this.supplierPrice * this.marginRate).toFixed(2));
});

ProductSchema.virtual('price').get(function () {
    return Number((this.supplierPrice + this.vat + this.margin).toFixed(2));
});

ProductSchema.virtual('size').get(function () {
    return this.caseSize;
});

ProductSchema.virtual('descName').get(function () {
    return this.name + ' (' + this.size + ')';
});

ProductSchema.set('toJSON', { getters: true });
ProductSchema.set('toObject', { getters: true });

ProductSchema.index({ name: 'text', supplierCode: 'text', description: 'text', tags: 'text', brand: 'text', supplier: 'text' });

mongoose.model('Product', ProductSchema);
