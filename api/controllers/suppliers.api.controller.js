'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Supplier = mongoose.model('Supplier'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'supplier already exists';
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
 * Create a supplier
 */
exports.create = function(req, res) {
	var supplier = new Supplier(req.body);
	//supplier.user = req.user;

	supplier.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(supplier);
		}
	});
};

/**
 * Show the current supplier
 */
exports.read = function(req, res) {
	res.jsonp(req.supplier);
};

/**
 * Update a supplier
 */
exports.update = function(req, res) {
	var supplier = req.supplier ;

	supplier = _.extend(supplier , req.body);

	supplier.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(supplier);
		}
	});
};

/**
 * Delete an supplier
 */
exports.delete = function(req, res) {
	var supplier = req.supplier ;

	supplier.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(supplier);
		}
	});
};

/**
 * List of suppliers
 */
exports.list = function(req, res) { 
    Supplier.find().sort('-created')
        //.populate('user', 'displayName')
        .exec(function(err, suppliers) {
		    if (err) {
			    return res.send(400, {
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(suppliers);
		    }
	    });
};

/**
 * supplier middleware
 */
exports.supplierByID = function(req, res, next, id) { 
    Supplier.findById(id)
        //.populate('user', 'displayName')
        .exec(function(err, supplier) {
		    if (err) return next(err);
		    if (! supplier) return next(new Error('Failed to load supplier ' + id));
		    req.supplier = supplier ;
		    next();
	    });
};
