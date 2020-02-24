import { LineItem, Discount } from './lineitem';
import Purchase from './purchase';
import Product from './product';
import { validateCount } from './validations';
import { ShippingQuoteService, ShippingQuote } from './shipping';

/**
 * {@link ShoppingCart} is a collection of one or more {@link Product}s that
 * can be purchased in a single transaction
 */
export default class ShoppingCart {

	/**
	 * The threshold for free shipping ($75), in cents.
	 */
	static get FREE_SHIPPING_THRESHOLD() { return 7500; }

	/**
	 * Creates a {@link ShoppingCart} using the given {@link ShippingQuoteService}.
	 */
	constructor(shippingQuoteService) {
		if (shippingQuoteService == undefined || shippingQuoteService == null) {
			console.error("Invalid ShippingQuoteService: " + shippingQuoteService);
		}
		this._items = {};
		this._itemCounts = {};
		this._promoCodes = [];
		this._shipping = null;
		this._shippingQuoteService = shippingQuoteService;
	}

	/**
	 * Add a promo code to this {@link ShoppingCart}.
	 *
	 * @param {string} code The promo code to add.
	 */
	addPromoCode(code) {
		if (!this._promoCodes.includes(code)) {
			this._promoCodes.push(code);
		}
		return this;
	}

	/**
	 * Remove a promo code from this {@link ShoppingCart}.
	 *
	 * @param {string} code The promo code to remove.
	 */
	removePromoCode(code) {
		this._promoCodes = this._promoCodes.filter((c) => c != code);
		return this;
	}

	/**
	 * Add the given {@link Product}(s) to this {@link ShoppingCart}.
	 * 
	 * @param {Product} product The {@link Product} to add.
	 * @param {number} pcs The number of pieces of the given {@link Product} to add.
	 *        (Optional, defaults to 1.)
	 */
	addProduct(product, pcs) {
		const additionalCount = pcs || 1;
		validateCount(additionalCount);
		const sku = product.sku;
		const oldCount = Object.keys(this._itemCounts).includes(sku) ? this._itemCounts[sku] : 0;
		this._itemCounts[sku] = oldCount + additionalCount;
		this._items[sku] = product;
		return this;
	}

	/**
	 * Remove the given {@link Product} from this {@link ShoppingCart}.
	 * 
	 * @param {Product|string} product The {@link Product} to remove, or its SKU.
	 */
	removeProduct(product) {
		const sku = (product instanceof Product) ? product.sku : product;
		this._items[sku] = undefined;
		this._itemCounts[sku] = undefined;
		return this;
	}

	/**
	 * Update the number of pieces of the given {@link Product} in this
	 * {@link ShoppingCart}.
	 * 
	 * @param {Product} product The {@link Product} to update the count for.
	 * @param {number} pcs The number of items for the given {@link Product}.
	 */
	updateProductCount(product, pcs) {
		validateCount(pcs);
		const sku = (product instanceof Product) ? product.sku : product;
		this._itemCounts[sku] = pcs;
		return this;
	}

	/**
	 * Update the shipping information this {@link ShoppingCart} is going to.
	 * 
	 * @param {ShippingInfo} shipping Where to ship these products.
	 */
	updateShipping(shipping) {
		this._shipping = shipping;
	}

	/**
	 * Returns a list of items currently in this {@link ShoppingCart} along
	 * with their counts (e.g. two pieces of the same SKU).
	 */
	get items() {
		return Object.keys(this._items).map(sku => {
			const product = this._items[sku];
			const count = this._itemCounts[product.sku];
			const discount = product.discount * count;  // TODO: potential bug, forgetting to multiply by count
			return new LineItem(product, count, discount);
		});
	}

	/**
	 * Calculate discounted totals for the {@link ShoppingCart}, returning the
	 * pending {@link Purchase} with all the applicable discounts applied.
	 * 
	 * @returns {Purchase|null}
	 */
	toPurchase() {
		const itemsAfterPromoCodeDiscounts = this.applyPromoCodeDiscounts(this.items);
		const itemsAfterMultiBuyDiscounts = this.applyMultiBuyDiscounts(itemsAfterPromoCodeDiscounts);
		const itemsAfterVolumeDiscounts = this.applyVolumeDiscounts(itemsAfterMultiBuyDiscounts);
		const finalItems = itemsAfterVolumeDiscounts;
		const shippingCost = this.qualifiesForFreeShipping(finalItems) ? 0 : this._shippingQuoteService.quote(this._shipping);
		const shippingQuote = new ShippingQuote(this._shipping.service, this._shipping.address, shippingCost);
		return new Purchase(finalItems, shippingQuote);
	}

	/**
	 * @private
	 */
	applyPromoCodeDiscounts(items) {
		if (this.hasPromoCode("FIRSTTIME")) {
			// 10% off everything
			return items.map(item => item.applyDiscount(10));
		}
		return items;
	}

	/**
	 * @private
	 */
	applyMultiBuyDiscounts(items) {
		return items.flatMap(item => {
			const totalDiscountPerPcs = item.totalDiscount / item.pcs;

			const resultingItems = [];
			const notEligibleFor20Pct = item.pcs % 5
			const eligibleFor20Pct = item.pcs - notEligibleFor20Pct;
			const eligibleFor20PctTotalDiscount = (eligibleFor20Pct / item.pcs) * item.totalDiscount;
			const notEligibleFor20PctTotalDiscount = (notEligibleFor20Pct / item.pcs) * item.totalDiscount;
			if (eligibleFor20Pct > 0) {
				resultingItems.push(new LineItem(item.product, eligibleFor20Pct, totalDiscountPerPcs * eligibleFor20Pct).applyDiscount(20));
			}

			const notEligibleFor10Pct = notEligibleFor20Pct % 3
			const eligibleFor10Pct = notEligibleFor20Pct - notEligibleFor10Pct;
			const eligibleFor10PctTotalDiscount = (eligibleFor10Pct / item.pcs) * item.totalDiscount;
			const notEligibleFor10PctTotalDiscount = (notEligibleFor10Pct / item.pcs) * item.totalDiscount;
			if (eligibleFor10Pct > 0) {
				resultingItems.push(new LineItem(item.product, eligibleFor10Pct, totalDiscountPerPcs * eligibleFor10Pct).applyDiscount(10));
			}

			if (notEligibleFor10Pct > 0) {
				resultingItems.push(new LineItem(item.product, notEligibleFor10Pct, totalDiscountPerPcs * notEligibleFor10Pct));
			}

			return resultingItems;
		});
	}

	/**
	 * @private
	 */
	applyVolumeDiscounts(items) {
		const total = items.reduce((total, item) => total + item.totalPrice, 0);
		if (total >= 20000) {
			return items.concat([ new Discount("-20% OVER $200", Math.floor(total * 0.2)) ]);
		} else if (total >= 10000) {
			return items.concat([ new Discount("-10% OVER $100", Math.floor(total * 0.1)) ]);
		}
		return items;
	}

	/**
	 * @private
	 */
	qualifiesForFreeShipping() {
		if (this.hasPromoCode("FREESHIP")) {
			return true;
		}
		const totalWithoutShipping = this.items.reduce((total, item) => total + item.totalPrice, 0);
		return totalWithoutShipping >= ShoppingCart.FREE_SHIPPING_THRESHOLD;
	}

	/**
	 * @private
	 */
	hasPromoCode(code) {
		return this._promoCodes.includes(code);
	}
}
