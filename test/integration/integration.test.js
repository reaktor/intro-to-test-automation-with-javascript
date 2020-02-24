const app = require('../../src/backend/app');
const request = require('supertest')(app);
const assert = require('assert');

describe('Backend API', () => {

  var cartId = null;

  beforeEach(() => {
    cartId = new Date().getTime();
  });

  describe('Purchasing a shirt and a suit', () => {
    test('should create a roughly correct receipt', async () => {
      await request
        .post(`/cart/${cartId}/product`)
        .send({
          sku: '50DOLLARSHIRT',
          name: 'Retro Designer T-shirt',
          regularPrice: 5000,
          salePrice: undefined
        })
        .expect(200);

      await request
        .post(`/cart/${cartId}/product`)
        .send({
          sku: 'CHEAPSUIT',
          name: 'Blue Two-Piece Suit Baggy Classic Fit',
          regularPrice: 29900,
          salePrice: 14950
        })
        .expect(200);

      await request
        .post(`/cart/${cartId}/shipping`)
        .send({
          service: "UPS Ground",
          address: "30 W 21st Street, New York, NY 10010"
        })
        .expect(200);

      // Let's request a plaintext "receipt" for visual verification
      await request
        .post(`/cart/${cartId}/purchase`)
        .set('Accept', 'text/plain')
        .send()
        .expect(200)
        .then(function(res, err) {
          console.log(res.text);
        });

      // Let's request a JSON "receipt" for visual verification
      await request
        .post(`/cart/${cartId}/purchase`)
        .set('Accept', 'application/json')
        .send()
        .expect(200)
        .then(function(res, err) {
          console.log(res.body);
          assert.equal(res.body.totals.saved, 16945);
          assert.equal(res.body.totals.shipping, 0);
          assert.equal(res.body.totals.price, 17955);
        });
    });
  });

});
