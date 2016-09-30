'use strict';

var products = require('../controllers/products.api.controller');

module.exports = function(app) {

	// Products Routes
	app.route('/api/products')
	    .get(products.list)
		.post(products.create);

    app.route('/api/products/count')
		.get(products.count);
	
	app.route('/api/products/tags')
		.get(products.tags);
		
	app.route('/api/products/brands')
		.get(products.brands);

    app.route('/api/products/suppliercodes')
		.get(products.supplierCodes);

	app.route('/api/products/:productId')
		.get(products.read)
		.put(products.update)
		.delete(products.delete);

	// Finish by binding the Product middleware
	app.param('productId', products.productByID);
};
