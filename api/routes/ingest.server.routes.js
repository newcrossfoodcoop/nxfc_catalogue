'use strict';

var ingestLogs = require('../controllers/ingest-logs.api.controller');
var ingests = require('../controllers/ingests.api.controller');

module.exports = function(app) {

	// ingests Routes
	app.route('/api/ingests')
		.get(ingests.list)
		.post(ingests.create);

	app.route('/api/ingests/:ingestId')
		.get(ingests.read)
		.put(ingests.update)
		.delete(ingests.delete);
		
	app.route('/api/ingests/:ingestId/start-run')
	    .get(ingests.run);

	app.route('/api/ingests/:ingestId/runs')
	    .get(ingestLogs.list);
	
	app.route('/api/ingests/runs/:ingestLogId')
	    .get(ingestLogs.read);
	
	app.route('/api/ingests/runs/:ingestLogId/log')
	    .get(ingestLogs.listEntries);

	// Finish by binding the ingest middleware
	app.param('ingestId', ingests.ingestByID);
	app.param('ingestLogId', ingestLogs.ingestLogByID);
};
