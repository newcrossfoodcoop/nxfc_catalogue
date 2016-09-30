'use strict';

/**
 * Module dependencies.
 */

var ingester = require('../controllers/ingester.service.controller');

module.exports = function() {
    var seneca = this;
    
    seneca
        .add({role: 'ingest', cmd: 'run'}, ingester.ingest)
        .listen({ pin: {role: 'ingest', cmd: 'run'}});
    
};
