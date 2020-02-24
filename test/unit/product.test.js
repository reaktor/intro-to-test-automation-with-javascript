var assert = require('chai').assert;
import { Product } from '../../src/domain';

describe('Product', function() {

	const validSku = "123123123";
	const validName = "T-shirt";
	const validPrice = 2590;

	describe('validations', function() {

		it('should reject an empty SKU', function() {
			assert.throws(() => {
				new Product("", validName, validPrice);
			}, 'Invalid SKU: ' + JSON.stringify("") + ' (string)');
		});

		it('should reject a too long SKU', function() {
			const tooLongSku = "123456789012345678901234567890123";
			assert.throws(() => {
				new Product(tooLongSku, validName, validPrice);
			}, 'Invalid SKU: ' + JSON.stringify(tooLongSku) + ' (string)');
		});

		it('should reject an empty name', function() {
			assert.throws(() => {
				new Product(validSku, "", validPrice);
			}, 'Invalid description: ' + JSON.stringify("") + ' (string)');
		});

		it('should reject a blank name', function() {
			assert.throws(() => {
				new Product(validSku, " \t", validPrice);
			}, 'Invalid description: ' + JSON.stringify(" \t") + ' (string)');
		});

		it('should reject a negative price', function() {
			assert.throws(() => {
				new Product(validSku, validName, -100);
			}, 'Invalid price: -100 (number)');
		});

		it('should reject a floating point price', function() {
			assert.throws(() => {
				new Product(validSku, validName, 12.34);
			}, 'Invalid price: 12.34 (number)');
		});

		it('should reject a sale price higher than regular price', function() {
			assert.throws(() => {
				new Product(validSku, validName, 1000, 1001);
			}, 'Sale price cannot be higher than regular price');
		});

		it('should reject a negative sale price', function() {
			assert.throws(() => {
				new Product(validSku, validName, 1000, -123);
			}, 'Invalid price: -123 (number)');
		});
	});

});
