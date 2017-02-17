'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Product = mongoose.model('Product'),
	_ = require('lodash');

var assert = require('assert');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Product already exists';
				break;
			default:
				message = 'Something went wrong';
				console.error(err);
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Product
 */
exports.create = function(req, res) {
	var product = new Product(req.body);

	product.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(product);
		}
	});
};

/**
 * Show the current Product
 */
exports.read = function(req, res) {
	res.jsonp(req.product);
};

/**
 * Update a Product
 */
exports.update = function(req, res) {
	var product = req.product ;

	product = _.extend(product , req.body);

	product.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(product);
		}
	});
};

/**
 * Delete an Product
 */
exports.delete = function(req, res) {
	var product = req.product ;

	product.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(product);
		}
	});
};

function buildListQuery(queryParams) {
    var itemsPerPage = parseInt(queryParams.itemsperpage || 20);
    var pageNumber = queryParams.pagenumber || 1;
    var sortParam = queryParams.sort || 'name';
    
    var query;
    var qp1 = {};
    var qp2;
    
    if (queryParams.published) {
        qp1.published = true;
    }
    
    if (queryParams.textsearch) {
        qp1.$text = { $search: queryParams.textsearch };
        qp2 = { score : { $meta: 'textScore' } };
        sortParam = { score : { $meta : 'textScore' } };
    }
    
    if (queryParams.tags) {
        qp1.tags = { $in: queryParams.tags };
    }
    
    if (queryParams.categories) {
        qp1.categories = { $in: queryParams.categories };
    }
    
    if (queryParams.ids) {
        var _ids = _.isArray(queryParams.ids) ? queryParams.ids : [queryParams.ids];
        var ids = _.map(_ids, function (id) {
            return mongoose.Types.ObjectId(id);
        });
        qp1._id = { $in: ids };
    }

    if (qp2) {
        query = Product.find(qp1,qp2);
    } else {
        query = Product.find(qp1);
    }
    
    return query
        .sort(sortParam)
        .populate('supplier', 'name')
        .skip(itemsPerPage * (pageNumber - 1))
        .limit(itemsPerPage);
}

/**
 * List of Products
 */
exports.list = function(req, res) {
    
    buildListQuery(req.query)
        .exec()
        .then((products) => {
            res.jsonp(products);
        })
        .catch((err) => {
            res.status(400).send({
                message: getErrorMessage(err)
            });
        });
};

exports.listPublished = function(req, res) {
    req.query.published = true;
    
    buildListQuery(req.query)
        .exec()
        .then((products) => {
            res.jsonp(products);
        })
        .catch((err) => {
            res.status(400).send({
                message: getErrorMessage(err)
            });
        });
};

exports.listByIds = function(req, res) {
    assert(_.isArray(req.body));
    assert(req.body.length <= 100);
    
    var ids = _.map(req.body, function (id) {
        return mongoose.Types.ObjectId(id);
    });
    
    Product.find({_id: {$in: ids}})
        .populate('supplier', 'name')
        .limit(100)
        .exec(function(err, products) {
		    if (err) {
			    return res.status(400).send({
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(products);
		    }
	    });
};

/**
 * Count products in query
 */
exports.count = function(req, res) {

    function cb(err, count) {
	    if (err) {
		    return res.status(400).send({
			    message: getErrorMessage(err)
		    });
	    } else {
		    res.jsonp({count: count});
	    }
    }
    
    var query;
    if (req.query.textsearch) {
        Product.count(
            { $text : { $search : req.query.textsearch } }, cb
        );
    } else if (req.query.tags) {
        Product.count({ $in: req.query.tags }, cb);
    } else {
        Product.count({}, cb);
    }
    
};

exports.tags = function(req, res) {
    Product.find().distinct('tags', function(err, tags){
    	if (err) {
		    return res.status(400).send({
			    message: getErrorMessage(err)
		    });
	    } else {
		    res.jsonp(tags);
	    }
    });
};

exports.categories = function(req, res) {
    Product.find().distinct('categories', function(err, tags){
    	if (err) {
		    return res.status(400).send({
			    message: getErrorMessage(err)
		    });
	    } else {
		    res.jsonp(tags);
	    }
    });
};

exports.brands = function(req, res) {
    Product.find().distinct('brand', function(err, brands){
    	if (err) {
		    return res.status(400).send({
			    message: getErrorMessage(err)
		    });
	    } else {
		    res.jsonp(brands);
	    }
    });
};

exports.supplierCodes = function(req, res) {
    Product.find().distinct('supplierCode', function(err, supplierCodes){
    	if (err) {
		    return res.status(400).send({
			    message: getErrorMessage(err)
		    });
	    } else {
		    res.jsonp(supplierCodes);
	    }
    });
};

/**
 * Product middleware
 */
exports.productByID = function(req, res, next, id) { 
    Product.findById(id)
        .populate('supplier', 'name')
        .exec(function(err, product) {
		    if (err) return next(err);
		    if (! product) return next(new Error('Failed to load Product ' + id));
		    req.product = product;
		    next();
	    });
};
