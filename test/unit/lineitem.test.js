var assert = require('chai').assert;
import { Product, LineItem } from '../../src/domain';

describe('LineItem', () => {

	const shirt = new Product("SHIRT", "Shirt", 2500);

	describe('validations', () => {

		it('should reject a negative item count', () => {
			assert.throws(() => new LineItem(shirt, -2, 0));
		});

		it('should reject a zero item count', () => {
			assert.throws(() => new LineItem(shirt, 0, 0));
		});

		it('should reject a negative discount', () => {
			assert.throws(() => new LineItem(shirt, 1, -500));
		});
	});

	describe('product with long name', () => {
		const productWithLongName = new Product("PANTS", "1234567890123456789012345678901234567890", 5900);

		it('should be trimmed to 32 characters', () => {
			const lineItem = new LineItem(productWithLongName, 1, 0, 5900);
			assert.equal(lineItem.description, "12345678901234567890123456789012");
		});
	});

});
