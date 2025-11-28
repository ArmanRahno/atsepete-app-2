const getFormattedTimeDifference = (date: Date): string => {
	// @ts-expect-error TS error on date-date operation: it shouldn't throw any errors.
	const minDelta = (new Date() - new Date(date)) / (60 * 1000);

	if (minDelta >= 24 * 60) {
		return `${Math.floor(minDelta / (24 * 60))} gün önce`;
	} else if (minDelta >= 60) {
		return `${Math.floor(minDelta / 60)} saat önce`;
	} else {
		return `${Math.floor(minDelta) <= 0 ? 0 : Math.floor(minDelta)} dakika önce`;
	}
};

export default getFormattedTimeDifference;
