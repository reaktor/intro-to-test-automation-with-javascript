import { printCents } from './money';
import { Discount, LineItem } from './lineitem';

/**
 * @class Purchase
 *
 * A {@link Purchase} represents the pending purchase for a {@link ShoppingCart}'s contents
 * with all the discounts applied, suitable for presenting in the "review" step of our 
 * purchase flow.
 */
export default class Purchase {

	/**
	 * Creates a {@link Purchase}.
	 * 
	 * @param {Array|LineItem} lineItems An {@link LineItem} or an {@link Array}
	 *        of {@link LineItem}s comprising this {@link Purchase}.
	 * @param {ShippingQuote} shipping quote.
	 */
	constructor(lineItems, shipping) {
		if (shipping == undefined) {
			console.error("Invalid ShippingQuote:", JSON.stringify(shipping));
			throw "Invalid ShippingQuote: " + JSON.stringify(shipping);
		}
		this._shipping = shipping;
		// TODO: possible bug: don't handle `undefined` (zero line items passed in)
		if (lineItems == undefined) {
			this._lineItems = [];
		} else if (Array.isArray(lineItems)) {
			this._lineItems = lineItems;
		} else {
			this._lineItems = [lineItems];
		}
	}

	toJSON() {
		const items = this.sortedItems();
		const lineItems = items.filter(item => item instanceof LineItem);
		const discounts = items.filter(item => item instanceof Discount);
		return {
			items: lineItems.map(item => {
				return {
					sku: item.sku,
					description: item.description,
					pcs: item.pcs,
					discount: item.totalDiscount,
					price: item.totalPrice
				};
			}),
			discounts: discounts.map(item => {
				return {
					description: item.description,
					discount: item.totalDiscount
				};
			}),
			totals: {
				saved: this.totalDiscount,
				shipping: this._shipping.cost,
				price: this.totalPrice
			}
		};
	}

	/**
	 * @private
	 */
	sortedItems() {
		const items = this.items;
		items.sort((a, b) => {
			if (a instanceof LineItem && b instanceof LineItem) {
				return a.sku > b.sku ? 1 : a.sku == b.sku ? 0 : -1;
			} else if (a instanceof Discount && b instanceof LineItem) {
				return 1;
			} else if (a instanceof Discount && b instanceof Discount) {
				return a.totalDiscount > b.totalDiscount ? 1 : -1;
			}
		});
		return items;
	}

	/**
	 * @returns {string} text representation of the entire {@link Purchase}, similar to
	 *          what you might see in a printed receipt.
	 */
	toString() {
		const width = 50;
		const lines = [];
		function topLine() {
			lines.push('\u250c' + "".padStart(width, '\u2500') + '\u2510');
		}
		function bottomLine() {
			lines.push('\u2514' + "".padStart(width, '\u2500') + '\u2518');
		}
		function center(content) {
			const text = (content || "").toString();
			const textWidth = text.length;
			const paddedWidth = (width / 2) + (textWidth / 2);
			lines.push("\u2502 " + text.padStart(paddedWidth, ' ') + " \u2502".padStart(width - paddedWidth, ' '));
		}
		function spread(left, right) {
			const leftStr = Array.isArray(left) ? left.join('  ') : (left || '').toString();
			const rightStr = Array.isArray(right) ? right.join('  ') : (right || '').toString();
			const paddedWidth = width - leftStr.length - rightStr.length - 2;			
			lines.push("\u2502 " + leftStr + "".padStart(paddedWidth, ' ') + rightStr + " \u2502");
		}

		topLine()
		center("TESTMART");
		center("");
		this.sortedItems().forEach(item => {
			if (item instanceof LineItem) {
				const totalPriceBeforeDiscounts = item.totalPrice + item.totalDiscount;
				spread(item.description, item.pcs);
				spread(item.sku, printCents(totalPriceBeforeDiscounts));
				if (item.totalDiscount > 0) {
					spread("Discount:", "(-" + printCents(item.totalDiscount) + ")");
				}
				spread("", printCents(item.totalPrice));
				center("");
			} else if (item instanceof Discount) {
				spread(item.description, "(-" + printCents(item.totalDiscount) + ")");
				center("");
			}
		});
		spread("You saved:", "(-" + printCents(this.totalDiscount) + ")");
		center("");
		spread("Shipping:", printCents(this._shipping.cost));
		spread("Total:", printCents(this.totalPrice));
		center();
		bottomLine();
		return lines.join("\n");
	}

	/**
	 * @returns {Array} Returns the {@link LineItem}s in this {@link Purchase}.
	 */
	get items() {
		return this._lineItems;
	}

	/**
	 * @returns {number} Returns the shipping cost of this {@link Purchase} after discounts, in cents.
	 */
	get shipping() {
		return this._shipping.cost;
	}

	/**
	 * @returns {number} Returns the total price of this {@link Purchase} after discounts, in cents.
	 */
	get totalPrice() {
		return this._lineItems.reduce((total, item) => {
			if (item instanceof LineItem) {
				return total + item.totalPrice;
			} else if (item instanceof Discount) {
				return total - item.totalDiscount;
			} else {
				console.warn("Unexpected type of line item:", item);
				return total;
			}
		}, 0) + this._shipping.cost;
	}

	/**
	 * @returns {number} Returns the total discounts applied to this {@link Purchase} in cents.
	 */
	get totalDiscount() {
		return this._lineItems.reduce((total, item) => {
			return total + item.totalDiscount;
		}, 0);
	}
}
