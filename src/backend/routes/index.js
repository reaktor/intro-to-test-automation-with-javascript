const express = require('express');

const router = express.Router();
const cartController = require('../controllers/cartController');
const { catchErrors } = require('../handlers/errorHandler');

router.post('/cart/:id/purchase', catchErrors(cartController.purchaseCart));
router.post('/cart/:id/shipping', catchErrors(cartController.updateShipping));

router.post('/cart/:id/code/:code', catchErrors(cartController.addPromoCode));
router.delete('/cart/:id/code/:code', catchErrors(cartController.removePromoCode));

router.post('/cart/:id/product', catchErrors(cartController.addProduct));
router.put('/cart/:id/product/:sku/count/:count', catchErrors(cartController.updateProductCount));
router.delete('/cart/:id/product/:sku', catchErrors(cartController.removeProduct));
router.delete('/cart/:id', catchErrors(cartController.removeAllProducts));

module.exports = router;
