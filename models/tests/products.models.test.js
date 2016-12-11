'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Product = mongoose.model('Product');

/**
 * Globals
 */
var product;

/**
 * Unit tests
 */
describe('Product Model Unit Tests:', () => {
	beforeEach((done) => {
		product = new Product({
			name: 'Product Name',
			supplier: '1234567890abcdef123456a0'
		});

		done();
	});

	describe('Method Save', () => {
		it('should be able to save without problems', () => {
			var err =  product.validateSync();
			should.not.exist(err);
		});

		it('should be able to show an error when try to save without name', () => { 
			product.name = '';

			var err = product.validateSync();
			should.exist(err);
		});
	});
	
	describe('Virtual Fields', () => {
	    it('should throw an error on unrecognised VATcode', () => {
	        product.supplierPrice = 1.1;
	        product.VATcode = 42;
	        should.throws(() => { product.vat });
	    });
	
	    it('should calculate the correct price with no VAT', () => {
	        product.supplierPrice = 1.1;
	        product.margin.should.equal(0);
	        product.vat.should.equal(0);
	        product.price.should.equal(1.1);
	    });
	    
	    it('should calculate the correct price with VAT', () => {
	        product.supplierPrice = 1.1;
	        product.VATcode = 1;
	        product.margin.should.equal(0);
	        product.vat.should.equal(0.22);
	        product.price.should.be.equal(1.32);
	    });
	    
	    it('should calculate the correct price with at most 2dp', () => {
	        product.supplierPrice = 1.111111;
	        product.margin.should.be.equal(0);
	        product.vat.should.be.equal(0);
	        product.price.should.be.equal(1.11);
	    });
	    
	    it('should round the price in a predictable way', () => {
	        product.supplierPrice = 1.115611;
	        product.VATcode = 1;
	        product.margin.should.be.equal(0);
	        product.vat.should.be.equal(0.22);
	        product.price.should.be.equal(1.34);
	    });
	    
	    it('should have a descName', () => {
	        product.descName.should.equal('Product Name (undefined)');
	    });
	})

	afterEach((done) => { 
		Product.remove().exec();

		done();
	});
});
