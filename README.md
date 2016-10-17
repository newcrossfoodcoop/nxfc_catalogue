[![Stories in Ready](https://badge.waffle.io/newcrossfoodcoop/nxfc.png?label=ready&title=Ready)](https://waffle.io/newcrossfoodcoop/nxfc)
# NXFC Catalogue

[![Join the chat at https://gitter.im/newcrossfoodcoop/nxfc](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/newcrossfoodcoop/nxfc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](http://drone.newcrossfoodcoop.org.uk/api/badges/newcrossfoodcoop/nxfc_catalogue/status.svg)](http://drone.newcrossfoodcoop.org.uk/newcrossfoodcoop/nxfc_catalogue)

[![Dependency Status](https://david-dm.org/newcrossfoodcoop/nxfc_catalogue.svg)](https://david-dm.org/newcrossfoodcoop/nxfc_catalogue)

This repository provides a docker image that can be run seperately as a worker
and an api sharing a mongo database and communicating with each other via
seneca calls over a web transport and a redis transport.

The purpose of these services is to:

* manage product and supplier information.
* ingest product data.

This collection of services uses the port range 3010-3019

## Technologies

* docker
* mongo
* redis
* seneca
* express
* raml
* drone
* gulp

## Getting started

The easiest way to get started is to make sure that you have the following tools 
installed:

* docker
* docker-compose
* gulp
* abao

To get the development setup running:

'''
$ docker-compose build
$ docker-compose up
'''

There is also a test configuration that should mimic the drone configuration.

## Useful local links:

The API documentation can be found by interrogating your server

* API documentation: http://localhost:3010
* RAML spec: http://localhost:3010/api.raml

## Running tests:

To run jshint and mocha tests:

'''
$ gulp test
'''

To run api tests against a running development server:

'''
$ abao api/raml/api.raml --server http://localhost:3000/api --hookfiles=api/raml/hooks/*.js
'''

