import { validateDescription, validatePrice } from './validations';

const uspsPriorityMail = 'USPS Priority Mail';
const upsGround = 'UPS Ground';
const fedexHomeDelivery = 'Fedex Home Delivery';

/**
 * @class ShippingService
 * @hideconstructor
 *
 * {@link ShippingService} is an enumeration of the supported shipping services.
 */
export class ShippingService {

	/**
	 * @returns {ShippingService} USPS Priority Mail
	 */
	static get USPSPriorityMail() { return new ShippingService(uspsPriorityMail); }

	/**
	 * @returns {ShippingService} UPS Ground
	 */
	static get UPSGround() { return new ShippingService(upsGround); }

	/**
	 * @returns {ShippingService} Fedex Home Delivery
	 */
	static get FedexHomeDelivery() { return new ShippingService(fedexHomeDelivery); }

	/**
	 * @private
	 * @param {string} name The name of this {@link ShippingService}.
	 */
	constructor(name) {
		this._name = name;
	}

	/**
	 * Returns the name of this {@link ShippingService}.
	 */
	get name() {
		return this._name;
	}

	/**
	 * @private
	 */
	static validateShippingService(service) {
		const validServices = [
			ShippingService.USPSPriorityMail,
			ShippingService.UPSGround,
			ShippingService.FedexHomeDelivery
		].map(service => service.name);
		const serviceName = (service instanceof ShippingService) ? service.name : service;
		if (!validServices.includes(serviceName)) {
			console.error("Not a valid shipping service:", serviceName, "is not among", validServices);
			throw "Invalid shipping service: " + serviceName;
		}
		return new ShippingService(serviceName);
	}
};

/**
 * @class ShippingInfo
 *
 * A {@link ShippingInfo} represents the shipping method, delivery address, and the
 * associated cost of shipping.
 */
export class ShippingInfo {

	/**
	 * Enumeration of supported shipping services.
	 */
	static get Service() { return ShippingServices; }

	/**
	 * Creates a {@link ShippingInfo}.
	 * 
	 * @param {string} service The name of the selected shipping service
	 *                 (e.g. UPS Ground or USPS Priority Mail).
	 * @param {string} address The delivery address.
	 */
	constructor(service, address) {
		ShippingService.validateShippingService(service);
		validateDescription(address);
		this._service = service;
		this._address = address;
	}

	/**
	 * Returns the selected shipping service.
	 */
	get service() {
		return this._service;
	}

	/**
	 * Returns the selected delivery address.
	 */
	get address() {
		return this._address;
	}
}

/**
 * @class ShippingQuote
 *
 * A {@link ShippingQuote} represents the shipping method, delivery address, and the
 * associated cost of shipping.
 */
export class ShippingQuote extends ShippingInfo {

	/**
	 * Creates a {@link ShippingInfo}.
	 * 
	 * @param {string} service The name of the selected shipping service
	 *                 (e.g. UPS Ground or USPS Priority Mail).
	 * @param {string} address The delivery address.
	 * @param {number} cost The cost of shipping, in cents.
	 */
	constructor(service, address, cost) {
		super(service, address);
		validatePrice(cost);
		this._cost = cost;
	}

	/**
	 * Returns the shipping cost, in cents.
	 */
	get cost() {
		return this._cost;
	}
}

/**
 * @class ShippingQuoteService
 * 
 * {@link ShippingQuoteService} quotes prices for a given {@link ShippingInfo}.
 */
export class ShippingQuoteService {

	/**
	 * Quotes the cost of shipping with the delivery address and shipping service
	 * indicated by the given {@link ShippingInfo}.
     *
	 * @returns {number} The cost of the given shipping method, in cents.
	 */
	quote(shippingInfo) {
		if (!!shippingInfo) {
			if (shippingInfo.service == ShippingService.USPSPriorityMail) {
				return 1000;
			} else if (shippingInfo.service == ShippingService.UPSGround) {
				return 2000;
			} else if (shippingInfo.service == ShippingService.FedexHomeDelivery) {
				return 3000;
			}
		}
		return 0;
	}
}
