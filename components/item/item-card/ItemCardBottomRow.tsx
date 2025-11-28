import { lightMutedForeground } from "@/constants/Colors";
import Marketplaces from "@/constants/Marketplaces";
import findCategoryLabel from "@/lib/findCategoryLabel";
import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import { Link } from "expo-router";
import { Text, View } from "react-native";

const ItemCardBottomRow = ({
	last_price_action_date_time,
	marketplace,
	category
}: {
	last_price_action_date_time: Item["last_price_action_date_time"];
	marketplace: Item["marketplace"];
	category: Item["category"];
}) => {
	const MarketplaceIcon = marketplace && Marketplaces.find(m => m.value === marketplace)?.Icon;

	return (
		<View className="flex-row items-center gap-3">
			<Text
				className="text-sm text-muted-foreground"
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{getFormattedTimeDifference(new Date(last_price_action_date_time))}
			</Text>

			<View className="w-[1px] h-3/4 bg-border" />

			<Link
				href={marketplace ? `/pazaryerleri/${marketplace}` : `/kategoriler/${category}`}
				className="text-sm text-muted-foreground font-medium"
				withAnchor
			>
				{(marketplace && MarketplaceIcon && <MarketplaceIcon />) ||
					(category && findCategoryLabel(category))}
			</Link>
		</View>
	);
};

export default ItemCardBottomRow;
