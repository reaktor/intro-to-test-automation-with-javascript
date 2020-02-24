const assert = require('assert');

import { validateDescription, validatePrice, validateSKU } from './validations';


/**
 * @class Product
 *
 * A {@link Product} represents one merchandise sold by our store. For example,
 * it could be a single t-shirt or a multi-pack of socks. Products are identified
 * by an alphanumeric SKU (Stock Keeping Unit) of a maximum of 16 characters, have
 * a human-readable name (which generally is but isn't guaranteed to be unique),
 * and an active price before any cart-specific discounts are applied.
 */
export default class Product {

	/**
	 * Creates a {@link Product}.
	 * 
	 * @param {string} sku The SKU of this {@link Product}.
	 * @param {string} name The name of this {@link Product}.
	 * @param {number} regularPrice The MSRP price of this {@link Product}, in cents,
	 *        before sales, promo codes, or any other discounts.
	 * @param {number|undefined} salePrice The current sale price of this
	 *        {@link Product}, in cents, or `undefined` if it's not on sale.
	 */
	constructor(sku, name, regularPrice, salePrice) {
		validateSKU(sku);
		validateDescription(name);
		validatePrice(regularPrice);
		validatePrice(salePrice || regularPrice);
		if (salePrice > regularPrice) {
			throw "Sale price cannot be higher than regular price"
		}
		this._sku = sku;
		this._name = name;
		this._regularPrice = regularPrice;
		this._salePrice = salePrice;
	}

	/**
	 * Returns the SKU of this {@link Product}.
	 */
	get sku() { return this._sku; }

	/**
	 * Returns the name of this {@link Product}.
	 */
	get name() { return this._name; }

	/**
	 * Returns the effective price of this {@link Product}, based on the
	 * {@link salePrice} if it's on sale, or the {@link regularPrice} if not.
	 */
	get price() { return this._salePrice || this._regularPrice; }

	/**
	 * Returns the regular price of this {@link Product}.
	 */
	get regularPrice() { return this._regularPrice; }

	/**
	 * Returns the sale price of this {@link Product}, or `undefined` if
	 * the {@link Product} is not on sale.
	 */
	get salePrice() { return this._salePrice; }

	/**
	 * Returns {true} if this {@link Product} is
	 * on sale.
	 */
	get sale() { return this._salePrice != this._price; }

	/**
	 * Returns the discount in cents, from the regular price. If not on sale,
	 * will return `0`.
	 */
	get discount() { return this.regularPrice - this.price; }
}
