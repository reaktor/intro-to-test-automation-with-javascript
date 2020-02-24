var assert = require('chai').assert;

import { ShoppingCart, Product, LineItem, Shipping } from '../../src/domain';

class FixedShippingQuoteService extends Shipping.ShippingQuoteService {
	constructor(fixedCost) {
		super();
		this.cost = fixedCost;
	}

	quote() { return this.cost; }
}

describe('ShoppingCart', () => {

	const shippingInfo = new Shipping.ShippingInfo(
		Shipping.ShippingService.USPSPriorityMail,
		"30 W 21st Street, New York, NY 10010"
	);
	const freeShippingQuoteService = new FixedShippingQuoteService(0);
	const shirt = new Product("SHIRT", "Shirt", 2500);
	const socks = new Product("SOCKS", "Crew socks", 500);
	const discountSocks = new Product("CHEAPSOCKS", "Cheap crew socks", 500, 300);

	describe('empty cart', () => {

		const cart = new ShoppingCart(freeShippingQuoteService);
		cart.updateShipping(shippingInfo);

		it('should contain no items', () => {
			assert.equal(cart.items.length, 0);
		});

		it('should produce an empty Purchase object', () => {
			const purchase = cart.toPurchase();
			assert.equal(purchase.items.length, 0);
			assert.equal(purchase.totalPrice, 0);
			assert.equal(purchase.totalDiscount, 0);
		});
	});

	describe('cart with regular-priced items and no other discounts', () => {

		const cart = new ShoppingCart(freeShippingQuoteService);
		cart.addProduct(shirt);
		cart.addProduct(socks);
		cart.updateShipping(shippingInfo);

		it('should contain the right amount of items', () => {
			assert.equal(cart.items.length, 2);
		});

		it('should contain the correct items', () => {
			const skus = cart.items.map(item => item.sku);
			assert.deepEqual(skus.sort(), [shirt.sku, socks.sku].sort());
		});

		describe('resulting Purchase', () => {

			const purchase = cart.toPurchase();

			it('should have the right amount of items', () => {
				assert.equal(purchase.items.length, 2);
			});

			it('should have the correct items', () => {
				const skus = purchase.items.map(item => item.sku);
				assert.deepEqual(skus.sort(), [shirt.sku, socks.sku].sort());
			});

			it('should have the correct total price', () => {
				assert.equal(purchase.totalPrice, shirt.price + socks.price);
			});

			it('should have zero total discounts', () => {
				assert.equal(purchase.totalDiscount, 0);
			});
		});

	});

	describe('cart with sale-priced items and no other discounts', () => {

		const cart = new ShoppingCart(freeShippingQuoteService);
		cart.addProduct(shirt);
		cart.addProduct(discountSocks);
		cart.updateShipping(shippingInfo);

		describe('resulting Purchase', () => {

			const purchase = cart.toPurchase();

			it('should have the right amount of items', () => {
				assert.equal(purchase.items.length, 2);
			});

			it('should have the correct items', () => {
				const skus = purchase.items.map(item => item.sku);
				assert.deepEqual(skus.sort(), [shirt.sku, discountSocks.sku].sort());
			});

			it('should have the correct total based on sale prices', () => {
				assert.equal(purchase.totalPrice, shirt.price + discountSocks.price);
			});

			it('should have zero total discounts', () => {
				assert.equal(purchase.totalDiscount, discountSocks.regularPrice - discountSocks.salePrice);
			});
		});

	});

	describe('shipping', () => {

		const freeShippingLimit = ShoppingCart.FREE_SHIPPING_THRESHOLD;

		// fixed $5 shipping fee
		const shipping = 500;
		const shippingQuoteService = new FixedShippingQuoteService(shipping);

		describe('regular-priced cart below $75', () => {

			const product = new Product("X", "X", freeShippingLimit - 10);
			const cart = new ShoppingCart(shippingQuoteService);
			cart.updateShipping(shippingInfo);
			cart.addProduct(product);
			const purchase = cart.toPurchase();

			it('should not get free shipping', () => {
				assert.equal(purchase.totalPrice, product.price + shipping);
			});
		});

		describe('regular-priced cart at or above $75', () => {

			const product = new Product("X", "X", freeShippingLimit);
			const cart = new ShoppingCart(shippingQuoteService);
			cart.updateShipping(shippingInfo);
			cart.addProduct(product);
			const purchase = cart.toPurchase();

			it('should get free shipping', () => {
				assert.equal(purchase.totalPrice, product.price);
			});
		});

		describe('cart with regular prices above $75 but sale prices below $75', () => {

			const product = new Product("X", "X", freeShippingLimit + 10, freeShippingLimit - 10);
			const cart = new ShoppingCart(shippingQuoteService);
			cart.updateShipping(shippingInfo);
			cart.addProduct(product);
			const purchase = cart.toPurchase();

			it('should not get free shipping', () => {
				assert.equal(purchase.totalPrice, product.price + shipping);
			});
		});

	});

	describe('promo codes', () => {

		describe('"FREESHIP"', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(shirt);
			cart.addPromoCode("FREESHIP");
			const purchase = cart.toPurchase();

			it('should give free shipping for any purchase', () => {
				assert.equal(purchase.totalPrice, shirt.price);
			});
		});

		describe('"FIRSTTIME"', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(shirt);
			cart.addProduct(socks);
			cart.addPromoCode("FIRSTTIME");
			const purchase = cart.toPurchase();

			it('should give 10% discount on entire purchase (shipping excluded)', () => {
				assert.equal(purchase.totalPrice, ((shirt.price + socks.price) * 0.9) + shipping);
			});

			it('should show the 10% discount on each line item', () => {
				const lineItemForShirt = purchase.items.find(item => item.sku == shirt.sku);
				assert.approximately(lineItemForShirt.totalPrice, shirt.price * 0.9, 0.001);
				assert.approximately(lineItemForShirt.totalDiscount, shirt.price * 0.1, 0.001);

				const lineItemForSocks = purchase.items.find(item => item.sku == socks.sku);
				assert.approximately(lineItemForSocks.totalPrice, socks.price * 0.9, 0.001);
				assert.approximately(lineItemForSocks.totalDiscount, socks.price * 0.1, 0.001);
			});
		});

	});

	describe('volume discounts', () => {

		describe('cart exceeding $100', () => {
			const product = new Product("50DOLLARSHIRT", "Pima Cotton Long Sleeve Pajama Top", 5000);
			const cart = new ShoppingCart(new FixedShippingQuoteService(0));
			cart.updateShipping(shippingInfo);
			cart.addProduct(product, 2);
			const purchase = cart.toPurchase();

			it('should get 10% discount on the entire order', () => {
				assert.equal(purchase.totalPrice, ((product.price * 2) * 0.9));
			});
		});

		describe('cart exceeding $200', () => {
			const product = new Product("100DOLLARSWAG", "Pima Cotton Long Sleeve Pajama Top", 10000);
			const cart = new ShoppingCart(new FixedShippingQuoteService(0));
			cart.updateShipping(shippingInfo);
			cart.addProduct(product, 2);
			const purchase = cart.toPurchase();

			it('should get 20% discount on the entire order', () => {
				assert.equal(purchase.totalPrice, ((product.price * 2) * 0.8));
			});
		});
	});

	describe('multi-buy discounts', () => {

		describe('cart with three of the same product', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(socks, 3);
			const purchase = cart.toPurchase();

			it('should give 10% discount on all three items', () => {
				assert.equal(purchase.totalPrice, ((socks.price * 3) * 0.9) + shipping);
			});
		});

		describe('cart with four of the same product', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(socks, 4);
			const purchase = cart.toPurchase();

			it('should give 10% discount on three of the items', () => {
				assert.equal(purchase.totalPrice, ((socks.price * 3) * 0.9) + socks.price + shipping);
			});
		});

		describe('cart with five of the same product', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(socks, 5);
			const purchase = cart.toPurchase();

			it('should give 20% discount on all five items', () => {
				assert.equal(purchase.totalPrice, ((socks.price * 5) * 0.8) + shipping);
			});
		});

		describe('cart with six of the same product', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(socks, 6);
			const purchase = cart.toPurchase();

			it('should give 20% discount on five items and no discount on the sixth', () => {
				assert.equal(purchase.totalPrice, ((socks.price * 5) * 0.8) + socks.price + shipping);
			});
		});

		describe('cart with eight of the same product', () => {

			const shipping = 500; // fixed $5 shipping fee
			const cart = new ShoppingCart(new FixedShippingQuoteService(shipping));
			cart.updateShipping(shippingInfo);
			cart.addProduct(socks, 8);
			const purchase = cart.toPurchase();

			it('should give 20% discount on five items and 10% discount on the other three', () => {
				assert.equal(purchase.totalPrice, ((socks.price * 5) * 0.8) + ((socks.price * 3) * 0.9) + shipping);
			});
		});
	});

});
