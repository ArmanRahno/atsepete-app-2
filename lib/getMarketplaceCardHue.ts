type MarketplaceHue = {
	dark: [string, string];
	light: [string, string];
};

const marketplaceHues: Record<string, MarketplaceHue> = {
	amazon: {
		dark: ["#687078", "#353A3D"],
		light: ["#EEF2F5", "#FAFBF8"]
	},
	hepsiburada: {
		dark: ["#3E2A18", "#2B2119"],
		light: ["#FFF0E2", "#FFF8EF"]
	},
	trendyol: {
		dark: ["#67583F", "#3A3023"],
		light: ["#FFF1E5", "#FFF8EF"]
	},
	n11: {
		dark: ["#251C3C", "#211B2A"],
		light: ["#F0EAFF", "#FAF7FF"]
	},
	mediamarkt: {
		dark: ["#3B1719", "#291819"],
		light: ["#FFE8EA", "#FFF6F4"]
	},
	pazarama: {
		dark: ["#2A1E31", "#211B25"],
		light: ["#EAF7EF", "#F8FBF4"]
	},
	idefix: {
		dark: ["#193744", "#20272A"],
		light: ["#E8F6FA", "#F8FBFA"]
	},
	dr: {
		dark: ["#30171D", "#25181A"],
		light: ["#FFE8EE", "#FFF7F6"]
	},
	ciceksepeti: {
		dark: ["#706B61", "#3D3932"],
		light: ["#FFF0E8", "#FFF8F3"]
	},
	turkcell: {
		dark: ["#A99D86", "#4A4236"],
		light: ["#FFF7D8", "#FFFBEF"]
	},
	koctas: {
		dark: ["#a5988d", "#817265"],
		light: ["#FFF1E3", "#FFF8EF"]
	},
	pttavm: {
		dark: ["#343016", "#282519"],
		light: ["#FFF5D6", "#FFFAEF"]
	},
	avansas: {
		dark: ["#4B4635", "#302E25"],
		light: ["#E8F6F6", "#F8FBF8"]
	},
	teknosa: {
		dark: ["#3C301B", "#2B2419"],
		light: ["#FFF0DD", "#FFF8EF"]
	}
};

const getMarketplaceCardHue = (
	marketplace: string | undefined,
	isDark: boolean
): [string, string, string] => {
	const hue = marketplace ? marketplaceHues[marketplace] : undefined;
	const [startColor, midColor] = hue
		? hue[isDark ? "dark" : "light"]
		: isDark
			? ["#30343A", "#242524"]
			: ["#EEF2F5", "#FAFBF8"];

	return [startColor, midColor, isDark ? "#1E1914" : "#FFFDF7"];
};

export default getMarketplaceCardHue;
