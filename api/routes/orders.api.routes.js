'use strict';

var orders = require('../controllers/orders.api.controller');

module.exports = function(app) {

	// orders Routes
	app.route('/api/orders')
		.get(orders.list)
		.post(orders.create);

	app.route('/api/orders/:orderId')
		.get(orders.read)
		.put(orders.update)
		.delete(orders.delete);
	
	app.route('/api/orders/:orderId/csv')
		.get(orders.csv)

	// Finish by binding the order middleware
	app.param('orderId', orders.orderByID);
};
