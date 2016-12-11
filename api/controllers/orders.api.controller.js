'use strict';

var	_ = require('lodash');
var assert = require('assert');
var csv = require('csv');
var thenify = require('thenify');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Order = mongoose.model('Order');

class UserError extends Error {}

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'order already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else if (err instanceof UserError) {
	    message = err.message;
	} else if (err.name === 'AssertionError') {
	    message = err.message;
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a order
 */
exports.create = function(req, res) {
	var order = new Order(req.body);

	order.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(order);
		}
	});
};

/**
 * Export order as csv
 */

exports.csv = function(req, res) {
    var order = req.order;
    
    Promise
        .resolve(order)
        .then(() => {
            assert.ok(order.supplier.customerId, 'supplier.customerId is missing');
            assert.ok(order.deliveryAddress, 'order.deliveryAddress is missing');
            assert.ok(order.deliveryMessage, 'order.deliveryMessage is missing');
            
            var input = [[ order.supplier.customerId, order.shortId, order.deliveryAddress, order.deliveryMessage ]];
            
            _(order.items)
                .each((item) => {
                    input.push([
                        item.product.supplierCode,
                        item.product.descName,
                        item.quantity + '_c'
                    ]);
                });
            
            return input;
        })
        .then((input) => {
            return thenify(csv.stringify)(input);
        })
        .then((output) => {
            res.set({
                'Content-disposition': 'attachment; filename=\"'+ order.supplier.customerId + order.shortId +'.csv\"',
                'Content-type': 'text/csv'
            });
            
            res.send(output);
        })
        .catch((err) => {
            res.status(400).send({
				message: getErrorMessage(err)
			});
        });
};

/**
 * Show the current order
 */
exports.read = function(req, res) {
	res.jsonp(req.order);
};

/**
 * Update a order
 */
exports.update = function(req, res) {
	var order = req.order ;

	order = _.extend(order , req.body);

	order.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(order);
		}
	});
};

/**
 * Delete an order
 */
exports.delete = function(req, res) {
	var order = req.order ;

	order.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(order);
		}
	});
};

/**
 * List of orders
 */
exports.list = function(req, res) { 
    Order.find().sort('-created')
        //.populate('user', 'displayName')
        .exec(function(err, orders) {
		    if (err) {
			    return res.status(400).send({
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(orders);
		    }
	    });
};

/**
 * order middleware
 */
exports.orderByID = function(req, res, next, id) { 
    Order.findById(id)
        .populate('supplier items.product')
        .exec(function(err, order) {
		    if (err) return next(err);
		    if (! order) return next(new Error('Failed to load order ' + id));
		    req.order = order ;
		    next();
	    });
};
