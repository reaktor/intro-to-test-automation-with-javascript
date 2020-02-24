const assert = require('assert');

import { validateCount, validatePrice, failValidation } from './validations';
import Product from './product';

/**
 * @class Discount
 */
export class Discount {

	/**
	 * Creates a {@link Discount}.
 	 *
	 * @param {string} description A name or description of this {@link Discount}.
	 * @param {number} discount The discount, in cents.
	 */
	constructor(description, discount) {
		this._description = description;
		this._discount = discount;
	}

	get description() { return this._description; }

	get totalDiscount() { return this._discount; }
}

/**
 * @class LineItem
 *
 * A {@link LineItem} represents one or more pieces of a single {@link Product}
 * being purchased. A {@link LineItem} is associated with a unit price, a
 * potential discount being applied to the {@link LineItem}, and the total price
 * of the {@link LineItem} after applying the discount.
 */
export class LineItem {

	/**
	 * Creates a {@link LineItem}.
 	 *
	 * @param {Product} product The {@link Product} this {@link LineItem} is for.
	 * @param {number} pcs The number of {@link Product}s this {@link LineItem} is for.
	 * @param {number} totalDiscount The total discount in cents to apply to this
	 *                 {@link LineItem}.
	 */
	constructor(product, pcs, totalDiscount) {
		validateCount(pcs);
		validatePrice(totalDiscount);
		const totalPrice = (product.price * pcs);
		if (totalPrice < 0) {
			failValidation("Cannot discount a product below zero");
		}
		this._product = product;
		this._pcs = pcs;
		this._totalDiscount = totalDiscount;
	}

	/**
	 * Creates a new {@link LineItem} by applying a discount on this {@link LineItem}.
	 * 
	 * @returns {LineItem} with the given percentage-wise discount applied.
	 */
	applyDiscount(percentagePoints) {
		const old = this._product;
		const newSalePrice = (old.salePrice || old.regularPrice) * (100 - percentagePoints) / 100.0;
		const newTotalDiscount = this._pcs * (old.regularPrice - newSalePrice);
		const newProduct = new Product(old.sku, old.name, old.regularPrice, newSalePrice);
		const discountedLineItem = new LineItem(newProduct, this._pcs, newTotalDiscount);
		return discountedLineItem;
	}

	/** Returns the {@link Product} of this {@link LineItem}. */
	get product() { return this._product; }

	/** Returns the SKU of this {@link LineItem}'s {@link Product}. */
	get sku() { return this.product.sku; }

	/** Returns the description of this {@link LineItem}'s {@link Product}. */
	get description() { return this.product.name.substring(0, 32); }

	/** Returns the count of this {@link LineItem}'s {@link Product}s. */
	get pcs() { return this._pcs; }

	/** Returns the unit price of this {@link LineItem}'s {@link Product}. */
	get unitPrice() { return this.product.price; }

	/**
	 * Returns the total discount applied to this {@link LineItem} in cents.
	 */
	get totalDiscount() { return this._totalDiscount; }

	/**
	 * Returns the total price of this {@link LineItem}'s {@link Product}s
	 * in cents after discounts have been applied.
	 */
	get totalPrice() { return this.product.price * this._pcs; }
}
