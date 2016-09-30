'use strict';

var assert = require('assert');
var rewire = require('rewire');

var ingester = rewire('../controllers/ingester.service.controller');

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
            startLog: waterfallStub,
            streamAndParse: waterfallStub,
            csvParser: waterfallStub,
            securityFormPost: waterfallStub
        });
        done();
    });

	it('test', function(done){
	    ingester.ingest({ 
	        log: function() {},
	        finish: function() {}
	    },function() {
	        console.log(arguments);
	        done();
	    });
	});
	
	after(function(done) {
	    revert();
	    done();
	})
});
