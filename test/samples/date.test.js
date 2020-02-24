
var assert = require('assert'); // using Node.js's built-in 'assert' library

describe('Date', function() {

	describe('#parse()', function() {

		const christmas = new Date(Date.parse("December 25, 2020"));

		it('should get the date correctly', function() {
			assert.equal(christmas.getFullYear(), 2020);
			assert.equal(christmas.getMonth(), 11);
			assert.equal(christmas.getDate(), 25);
		});

		it('should default time-of-day to midnight', function() {
			assert.equal(christmas.getHours(), 0);
			assert.equal(christmas.getMinutes(), 0);
			assert.equal(christmas.getSeconds(), 0);
			assert.equal(christmas.getMilliseconds(), 0);
		});
	});

	describe('#now()', function() {

		it('should return different values as time passes by', function(done) {
			const first = Date.now();
			setTimeout(function() {
				const second = Date.now();
				assert.equal(second > first, true);
				done();
			}, 50);
		});

		it('should return similar values to doing `new Date().getTime()`', function(done) {
			const before = new Date().getTime();

			setTimeout(function() {
				const during = Date.now();
				assert.equal(before < during, true);

				setTimeout(function() {
					const after = new Date().getTime();
					assert.equal(during < after, true);
					done();
				}, 50);
			}, 50);
		});
	});
});
