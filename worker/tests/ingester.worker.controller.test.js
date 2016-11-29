'use strict';

var assert = require('assert');
var rewire = require('rewire');

var ingester = rewire('../controllers/ingester.worker.controller');

/**
 * Ingester controller tests
 */

function waterfallStub(args, callback) {
    callback(null,args);
}

describe('Ingester Controller Tests:', function() {
    var revert;

    before(function(done) {
        revert = ingester.__set__({
            makeContext: waterfallStub,
            startLogging: waterfallStub,
            streamAndParse: waterfallStub,
            csvParser: waterfallStub,
            securityFormPost: waterfallStub
        });
        done();
    });

	it('stubbed ingest', function(done){
	    ingester.ingest({ 
	        log: function() {},
	        finish: function() {}
	    },done);
	});
	
	after(function(done) {
	    revert();
	    done();
	})
});
