'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
//	User = mongoose.model('User'),
	Product = mongoose.model('Product');

/**
 * Globals
 */
var product;

/**
 * Unit tests
 */
describe('Product Model Unit Tests:', function() {
	beforeEach(function(done) {
//		user = new User({
//			firstName: 'Full',
//			lastName: 'Name',
//			displayName: 'Full Name',
//			email: 'test@test.com',
//			username: 'username',
//			password: 'password'
//		});

//		user.save(function() { 
			product = new Product({
				name: 'Product Name',
				supplier: '1234567890abcdef123456a0'
//				user: user
			});

			done();
//		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function() {
			var err =  product.validateSync();
			should.not.exist(err);
		});

		it('should be able to show an error when try to save without name', function() { 
			product.name = '';

			var err = product.validateSync();
			should.exist(err);
		});
	});

	afterEach(function(done) { 
		Product.remove().exec();
//		User.remove().exec();

		done();
	});
});
