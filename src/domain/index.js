export { LineItem, Discount } from './lineitem';
export { default as Product } from './product';
export { default as Purchase } from './purchase';
export { default as ShoppingCart } from './shoppingcart';

import * as ShippingNamespace from './shipping';
export const Shipping = ShippingNamespace;
