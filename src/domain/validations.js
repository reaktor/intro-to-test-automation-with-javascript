
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' && 
    isFinite(value) && 
    Math.floor(value) === value;
};

export function failValidation(message, value) {
	if (global.debug) {
		console.error("" + message + ":", value);
	}
	throw "" + message + ": " + JSON.stringify(value) + " (" + typeof value + ")";
}

export function validateSKU(value) {
	if (typeof value != "string" || value.trim().length != value.length || value.length == 0 || value.length > 16) {
		failValidation("Invalid SKU", value);
	}
}

export function validatePrice(value) {
	if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
		failValidation("Invalid price", value);
	}
}

export function validateDescription(value) {
	if (typeof value != "string" || value.trim().length == 0) {
		failValidation("Invalid description", value);
	}
}

export function validateCount(value) {
	if (isNaN(value) || value < 1) {
		failValidation("Invalid count", value);
	}
}
