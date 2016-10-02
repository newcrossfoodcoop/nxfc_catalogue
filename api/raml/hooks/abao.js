var hooks = require('hooks'),
    assert = require('assert');

var request = require('request');
var url = require('url');

var store = {};

hooks.before('GET /suppliers/{supplierId} -> 200', function (test, done) {
    test.request.params.supplierId = store.supplier._id;
    done();
});

hooks.after('POST /suppliers -> 200', function (test, done) {
    store.supplier = test.response.body;
    
    // seed an extra supplier for the ingest/runs calls
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            store.supplier2 = bod;
            done();
        }
    );
});

hooks.before('GET /products/{productId} -> 200', function (test, done) {
    test.request.params.productId = store.product._id;
    done();
});

hooks.after('POST /products -> 200', function (test, done) {
    store.product = test.response.body;
    done();
});

hooks.before('GET /ingests/{ingestId} -> 200', function (test, done) {
    test.request.params.ingestId = store.ingest._id;
    done();
});

hooks.before('POST /ingests -> 200', function (test,done) {
    test.request.body.supplier = store.supplier2._id;
    var serverUrl = url.parse(test.request.server);
    
    // if a port is defined munge it for the environment
    if (serverUrl.port) {
        var downloadUrl = url.parse(test.request.body.downloadUrl);
        downloadUrl.port = serverUrl.port;
        
        // if we're in test mode change the host too
        if (serverUrl.port === 3001) {
            downloadUrl.hostname = serverUrl.hostname;
        }
        
        // make sure format uses our new values
        downloadUrl.host = null;
        test.request.body.downloadUrl = url.format(downloadUrl);
    }
    
    done();
});

hooks.after('POST /ingests -> 200', function (test,done) {
    store.ingest = test.response.body;
    
    // seed an extra ingest for the ingest/runs calls
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            store.ingest2 = bod;
            done();
        }
    );
});

hooks.before('GET /ingests/{ingestId}/start-run -> 200', function (test, done) {
    test.request.params.ingestId = store.ingest2._id;
    done();
});

hooks.after('GET /ingests/{ingestId}/start-run -> 200', function (test, done) {
    store.ingestRunId = test.response.body.ingestLog;
    done();
});

hooks.before('GET /ingests/{ingestId}/runs -> 200', function (test, done) {
    test.request.params.ingestId = store.ingest2._id;
    done();
});

//hooks.after('GET /ingests/{ingestId}/runs -> 200', function (test, done) {
//    console.log(test);
//    store.ingestRun = test.response.body[0];
//    done();
//});

hooks.before('GET /ingests/runs/{runId} -> 200', function (test, done) {
    test.request.params.runId = store.ingestRunId;
    done();
});

hooks.before('GET /ingests/runs/{runId}/log -> 200', function (test, done) {
    test.request.params.runId = store.ingestRunId;
    done();
});
