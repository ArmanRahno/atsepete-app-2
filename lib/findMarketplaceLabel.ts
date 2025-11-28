import Marketplaces from "@/constants/Marketplaces";

const findMarketplaceLabel = (marketplace: string) => {
	return Marketplaces.find(m => m.value === marketplace)?.label || marketplace;
};

export default findMarketplaceLabel;
