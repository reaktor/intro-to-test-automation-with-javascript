describe('Routes: Beers', () => {
  beforeAll(() => models.sequelize.sync());

  beforeEach(() => Promise.all([
    models.Beer.destroy({ truncate: true }),
    models.BeerCategory.destroy({ truncate: true }),
  ]));

  describe('POST /beers', () => {
    test('should create a beer and respond with its body', async () => {
      const beerCategory = await models.BeerCategory.create({ name: 'johndoe beer category' });
      await request
        .post('/beers')
        .send({ name: 'johndoe beer', beer_category_id: beerCategory.id })
        .expect(201)
        .expect(/johndoe beer/);
    });
  });

});
