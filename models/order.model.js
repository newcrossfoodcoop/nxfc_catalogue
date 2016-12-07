'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var shortid = require('shortid');

var OrderSchema = new Schema({
    shortId: {
        type: String,
        default: shortid.generate()
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        purchasePaid: {
            type: Number
        }
    }],
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    stockOrderId: {
        type: Schema.Types.ObjectId,
        ref: 'Stock.Order'
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    deliveryMessage: {
        type: String,
        required: true
    },
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

var Order = mongoose.model('Order', OrderSchema);
