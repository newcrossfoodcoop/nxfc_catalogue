'use strict';

var suppliers = require('../controllers/suppliers.api.controller');

module.exports = function(app) {

	// suppliers Routes
	app.route('/api/suppliers')
		.get(suppliers.list)
		.post(suppliers.create);

	app.route('/api/suppliers/:supplierId')
		.get(suppliers.read)
		.put(suppliers.update)
		.delete(suppliers.delete);

	// Finish by binding the supplier middleware
	app.param('supplierId', suppliers.supplierByID);
};
