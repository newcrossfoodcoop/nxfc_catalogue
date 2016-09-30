'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
	gulp = require('gulp'),
	assets = require('./config/env/default').assets,
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins(),
	args = require('get-gulp-args')();

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
	process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
	process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
	process.env.NODE_ENV = 'production';
});

// Set NODE_ENV to 'stage'
gulp.task('env:stage', function () {
	process.env.NODE_ENV = 'stage';
});

// Nodemon task
gulp.task('nodemon:api', function () {
	return plugins.nodemon({
		script: 'api.js',
		nodeArgs: ['--debug'],
		ext: 'js',
		watch: _.union([assets.models, assets.config, assets.routes, assets.apiControllers])
	});
});

gulp.task('nodemon:service', function () {
	return plugins.nodemon({
		script: 'service.js',
		nodeArgs: ['--debug=5859'],
		ext: 'js',
		watch: _.union([assets.models, assets.config, assets.actions, assets.serviceControllers])
	});
});

function spawnNode(entry){
    var nodeArgs = [entry];
    var spawn = require('child_process').spawn;
    console.log(args);
    
    _(['stack-size', 'debug', 'max_old_space_size'])
        .forEach(function(k) {
            var sk = 'spawn_' + k;
            if (!_.has(args,sk)) { return; }
            if (typeof(args[sk]) !== 'undefined') {nodeArgs.push( '--' + k + '=' + args[sk] );}
            else {nodeArgs.push('--' + k);}
        });
    console.log('spawning: node',nodeArgs);
    spawn('node', nodeArgs, {stdio: 'inherit'}); 
}

gulp.task('node:service', function () { spawnNode('service.js') });
gulp.task('node:api',     function () { spawnNode('api.js') });

// JS linting task
gulp.task('jshint', function () {
	return gulp.src(_.union([assets.models, assets.config, assets.actions, assets.serviceControllers, assets.apiControllers]))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.jshint.reporter('fail'));
});

// Mocha tests task
gulp.task('mocha', function (done) {
	var error;
	var mongoose = require('./config/lib/mongoose');
	mongoose.loadModels();

	// Run the tests
	gulp.src(_.union([assets.tests.service,assets.tests.api]))
		.pipe(plugins.mocha({
			reporter: 'spec',
			timeout: 4000
		}))
		.on('error', function (err) {
			// If an error occurs, save it
			console.log(err);
			error = err;
		})
		.on('end', function() {
			done(error);
		});

});

// API documentation from raml
gulp.task('ramldoc', function() {
  return gulp.src('api/raml/api.raml')
    .pipe(plugins.raml2html())
    .pipe(gulp.dest('api/build'));
});

// Build documentation
gulp.task('build:docs', function(done) {
	runSequence('ramldoc', done);
});

// Build documentation
gulp.task('build', function(done) {
	runSequence('build:docs', done);
});

// Run the project tests
gulp.task('test', function(done) {
	runSequence('env:test', 'jshint', 'mocha', done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'jshint', 'default:message', done);
});

gulp.task('default:message', function(done) {
    console.log('\nTo run the parts:\n\tgulp api\n\tgulp service\n');
});

gulp.task('api', function(done) {
	runSequence('env:dev', 'jshint', 'nodemon:api', done);
});

gulp.task('service', function(done) {
	runSequence('env:dev', 'jshint', 'nodemon:service', done);
});

// Run the project in production mode
gulp.task('test:api', function(done) {
	runSequence('env:test', 'node:api', done);
});

gulp.task('test:service', function(done) {
	runSequence('env:test', 'node:service', done);
});

// Run the project in production mode
gulp.task('prod:api', function(done) {
	runSequence('env:prod', 'node:api', done);
});

gulp.task('prod:service', function(done) {
	runSequence('env:prod', 'node:service', done);
});

// Run the project in stage mode
gulp.task('stage:api', function(done) {
	runSequence('env:stage', 'node:api', done);
});

gulp.task('stage:service', function(done) {
	runSequence('env:stage', 'node:service', done);
});


