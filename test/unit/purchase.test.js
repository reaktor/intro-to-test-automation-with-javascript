const assert = require('chai').assert;
import { Purchase, Product, LineItem, Shipping } from '../../src/domain';

describe('Purchase', () => {

	const shippingQuote = new Shipping.ShippingQuote(
		Shipping.ShippingService.UPSGround,
		"1 Times Square, New York, NY",
		500
	);

	const shirt = new Product("SHIRT", "Shirt", 2500);
	const socks = new Product("SOCKS", "Crew socks", 1000)

	describe('#constructor()', () => {

		it('should accept a single LineItem', () => {
			const lineItem = new LineItem(shirt, 1, 0);
			const purchase = new Purchase(lineItem, shippingQuote);
			assert.equal(purchase.totalPrice, shirt.price + shippingQuote.cost);
		});

		it('should accept an array of LineItems', () => {
			const lineItem = new LineItem(shirt, 1, 0);
			const purchase = new Purchase([lineItem], shippingQuote);
			assert.equal(purchase.totalPrice, shirt.price + shippingQuote.cost);
		});
	});

	describe('single-item purchase without discounts', () => {

		const lineItem = new LineItem(shirt, 1, 0);
		const purchase = new Purchase([lineItem], shippingQuote);

		it('should calculate total discount', () => {
			assert.equal(0, purchase.totalDiscount);
		});

		it('should calculate total price', () => {
			assert.equal(purchase.totalPrice, lineItem.totalPrice + shippingQuote.cost);
		});
	});

	describe('single-item purchase with a discount', () => {

		const lineItem = new LineItem(shirt, 1, 100);
		const purchase = new Purchase([lineItem], shippingQuote);

		it('should calculate total discount', () => {
			assert.equal(purchase.totalDiscount, 100);
		});

		it('should calculate total price', () => {
			assert.equal(purchase.totalPrice, lineItem.totalPrice + shippingQuote.cost);
		});
	});

	describe('multi-item purchase with discounts', () => {

		const oneShirt = new LineItem(shirt, 1, 100);
		const twoSocks = new LineItem(socks, 2, 500);
		const purchase = new Purchase([oneShirt, twoSocks], shippingQuote);

		it('should calculate total discount', () => {
			assert.equal(purchase.totalDiscount, oneShirt.totalDiscount + twoSocks.totalDiscount);
		});

		it('should calculate total price', () => {
			assert.equal(purchase.totalPrice, oneShirt.totalPrice + twoSocks.totalPrice + shippingQuote.cost);
		});
	});
});
