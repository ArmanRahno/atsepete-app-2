type PricePoint = {
	price?: number | null;
	date_time?: string | Date | null;
};

export default function getPreviousPrice(priceHistory: PricePoint[]): number | null {
	const validHistory = priceHistory.filter(
		point => point && typeof point.price === "number" && point.date_time
	);

	if (validHistory.length < 2) return null;

	const latestPrice = validHistory[validHistory.length - 1]?.price;

	if (typeof latestPrice !== "number") return null;

	for (let i = validHistory.length - 2; i >= 0; i--) {
		const candidate = validHistory[i]?.price;
		if (typeof candidate === "number" && candidate !== latestPrice) {
			return candidate;
		}
	}

	return null;
}
