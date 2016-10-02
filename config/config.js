'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    path = require('path');

/**
 * Get files by glob patterns
 */
var getGlobbedPaths = function(globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (excludes) {
                files = files.map(function(file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            file = file.replace(excludes[i], '');
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};

/**
 * Validate NODE_ENV existance
 */
var validateEnvironmentVariable = function() {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');

    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        } else {
            console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
        }
        process.env.NODE_ENV = 'development';
    } else {
        console.log(chalk.bold('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
    }
    // Reset console color
    console.log(chalk.white(''));
};

/**
 * Validate external service configuration
 */
 
var validateServiceConfigs = function(config) {
    var mongo = config.mongo;
    if(!mongo.uri) {
        if (mongo.db) {
            mongo.uri = 'mongodb://' + mongo.host + '/' + mongo.db;
        }
        else {
            console.error(chalk.red('Cannot resolve mongo configuration'));
        }
    }
};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function(config, assets) {
    // Appending files
    config.files = {
        actions: {},
        models: {},
        routes: {}
    };
    
    // Setting Globbed worker files
    config.files.actions = getGlobbedPaths(assets.actions);
    
    // Setting Globbed model files
    config.files.models = getGlobbedPaths(assets.models);
    
    // Setting Globbed routes files
    config.files.routes = getGlobbedPaths(assets.routes);
};

/**
 * Initialize global configuration
 */
var initGlobalConfig = function() {
    // Validate NDOE_ENV existance
    validateEnvironmentVariable();

    // Get the default config
    var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

    // Get the current config
    var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    var config = _.defaultsDeep(environmentConfig, defaultConfig);
    
    // Groc external service configs
    validateServiceConfigs(config);
    
    // Initialize global globbed files
    initGlobalConfigFiles(config, config.assets);

    // Expose configuration utilities
    config.utils = {
        getGlobbedPaths: getGlobbedPaths
    };

    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
