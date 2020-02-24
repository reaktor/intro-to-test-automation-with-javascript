export function printCents(cents) {
	const dollars = cents / 100.0;
	return '$' + dollars.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
