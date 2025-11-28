const formatPrice = (price: number) => {
	const currency_symbol = "₺";
	const formatter = new Intl.NumberFormat("tr-TR", {
		style: "currency",
		currency: "TRY",
		minimumFractionDigits: 2
	});
	return formatter.format(price).replace(currency_symbol, "");
};

export default formatPrice;
