const { ShoppingCart, Product, LineItem, Purchase, Shipping } = require('../../domain');
const { ShippingInfo, ShippingQuote, ShippingService, ShippingQuoteService } = Shipping;
const debug = require('debug')('api');


const carts = {};

const getOrCreateCart = (id) => {
  const existingCart = carts[id];
  if (existingCart) {
    return existingCart;
  }
  carts[id] = new ShoppingCart(new ShippingQuoteService());
  return carts[id];
};

const purchaseCart = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  const purchase = cart.toPurchase();
  if (req.accepts(['text/plain', 'text/html'])) {
    return res.status(200).set('Content-Type', 'text/plain').send(purchase.toString());
  } else {
    return res.status(200).json(purchase.toJSON());
  }
};

const addPromoCode = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  cart.addPromoCode(req.params.code);
  res.status(200).send();
};

const removePromoCode = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  cart.removePromoCode(req.params.code);
  res.status(200).send();
};

const updateShipping = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  const service = ShippingService.validateShippingService(req.body.service);
  cart.updateShipping(new ShippingInfo(service, req.body.address));
  res.status(200).send();
};

const addProduct = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  const json = req.body;
  debug("addProduct: ", json)
  cart.addProduct(new Product(json.sku, json.name, json.regularPrice, json.salePrice));
  res.status(200).send();
};

const updateProductCount = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  const sku = req.params.sku;
  const pcs = req.params.count;
  debug("updateProductCount: ", sku, pcs);
  cart.updateProductCount(sku, pcs);
  res.status(200).send();
};

const removeProduct = async (req, res) => {
  const cart = getOrCreateCart(req.params.id);
  const sku = req.params.sku;
  cart.removeProduct(sku);
  res.status(200).send();
};

const removeAllProducts = async (req, res, next) => {
  carts[req.params.id] = undefined;
  res.status(200).send();
};

module.exports = {
  addPromoCode,
  removePromoCode,
  addProduct,
  removeProduct,
  removeAllProducts,
  purchaseCart,
  updateShipping
};
