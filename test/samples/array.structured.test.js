
var assert = require('assert'); // using Node.js's built-in 'assert' library

// A `describe` block defines a logical collection of specifications related to
// the named concept. In this case, we're describing an "Array", referring to
// the built-in JavaScript type:
describe('Array', () => {

	// We're going to define a variable in this scope to be (re)used by all/most
	// tests within the scope:
	var abc;

	// A `beforeEach` block runs before all tests within this scope ('Array')
	// and is typically used for setting up some shared "starting point" type
	// of data for the actual tests to use:
	beforeEach(() => {
		abc = ["A", "B", "C"];
	});

	describe('#indexOf()', () => {

		it('should return -1 when the value is not present', () => {
			assert.equal(abc.indexOf("Z"), -1);
		});

		it('should return the correct index when the value is present', () => {
			assert.equal(abc.indexOf("A"), 0);
			assert.equal(abc.indexOf("B"), 1);
			assert.equal(abc.indexOf("C"), 2);
		});

	});

	describe('#includes()', () => {

		it('should return false when the value is not present', () => {
			assert.equal(abc.includes("Z"), false);
		});

		it('should return true when the value is present', () => {
			assert.equal(abc.includes("A"), true);
		});

	});

});
