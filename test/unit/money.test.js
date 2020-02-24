var assert = require('chai').assert;

import { printCents } from '../../src/domain/money';

describe('printCents()', () => {

	it('should print cents with two-digit precision', () => {
		assert.equal(printCents(0), '$0.00');
		assert.equal(printCents(5), '$0.05');
		assert.equal(printCents(15), '$0.15');
		assert.equal(printCents(100), '$1.00');
		assert.equal(printCents(101), '$1.01');
		assert.equal(printCents(125), '$1.25');
	});

	it('should group dollars with a comma', () => {
		assert.equal(printCents(1200), '$12.00');
		assert.equal(printCents(12300), '$123.00');
		assert.equal(printCents(123400), '$1,234.00');
		assert.equal(printCents(1234500), '$12,345.00');
		assert.equal(printCents(12345600), '$123,456.00');
		assert.equal(printCents(123456700), '$1,234,567.00');
		assert.equal(printCents(1234567800), '$12,345,678.00');
	});
});