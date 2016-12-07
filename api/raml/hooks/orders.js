var hooks = require('hooks'),
    assert = require('assert');

var request = require('request');

var order_supplier;

hooks.after('POST /suppliers -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            order_supplier = bod;
            done();
        }
    );
});

var order_product;

hooks.after('POST /products -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            order_product = bod;
            done();
        }
    );
});

hooks.before('POST /orders -> 200', function (test,done) {
    test.request.body.supplier = order_supplier._id;
    test.request.body.items[0].product = order_product._id;
    done();
});

var order;

hooks.after('POST /orders -> 200', function (test,done) {
    order = test.response.body;
    done();
});

var output_order;

hooks.after('POST /orders -> 200', function (test,done) {    
    // seed an extra order for the csv calls
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            output_order = bod;
            done();
        }
    );
});

hooks.before('GET /orders/{orderId} -> 200', function (test, done) {
    test.request.params.orderId = order._id;
    done();
});

hooks.before('GET /orders/{orderId}/csv -> 200', function (test, done) {
    test.request.params.orderId = output_order._id;
    done();
});

hooks.after('GET /orders/{orderId}/csv -> 200', function (test, done) {
    assert(
        test.response.headers['content-disposition'].match(/^attachment; filename="1234[a-zA-Z0-9-_]{9}.csv"$/),
        'content-disposition does not match expected format'     
    );
    assert(
        test.response.headers['content-length'] > 0,
        'attachment has 0 length'
    );
    done();
});
