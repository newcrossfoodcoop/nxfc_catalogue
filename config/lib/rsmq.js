'use strict';

/**
 * Module dependencies.
 */
var config = require('../config');
var path = require('path');
var RSMQWorker = require( 'rsmq-worker' );

module.exports.init = function () {
    var worker = new RSMQWorker( 'rsmq_catalogue_'  + process.env.NODE_ENV, {
        host: config.redis.host,
        port: 6379,
        autostart: true,
        timeout: 20000
    });
    
    module.exports.queue = worker;
    
    // Listen to errors
    worker.on('error', function( err, msg ){
        console.error( 'RSMQ_ERROR', err, msg.id );
    });
    worker.on('timeout', function( msg ){
        console.error( 'RSMQ_TIMEOUT', msg.id, msg.rc );
    });

    // handle exceeded messages
    // grab the internal rsmq instance
//    var rsmq = worker._getRsmq();
    worker.on('exceeded', function( msg ){
        console.error( 'RSMQ_EXCEEDED', msg.id );
//        // NOTE: make sure this queue exists
//        rsmq.sendMessage( 'rsmq_catalogue_'  + process.env.NODE_ENV + '_exceeded', msq, function( err, resp ){
//            if( err ){
//                console.error( 'write-to-exceeded-queue', err )
//            }
//        });
    });
    
    return worker;
};

module.exports.initWorker = function () {
    var worker = module.exports.init();

	config.files.actions.forEach(function (actionPath) {
	    require(path.resolve(actionPath))(worker);
	});

};
