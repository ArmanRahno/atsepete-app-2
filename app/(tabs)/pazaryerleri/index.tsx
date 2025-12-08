import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import Header from "@/components/header/Header";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import HeaderText from "@/components/header/HeaderText";
import ResizedMarketplaceImage from "@/components/ResizedMarketplaceImage";
import Marketplaces from "@/constants/Marketplaces";
import { Link } from "expo-router";
import { FlatList, TouchableOpacity } from "react-native";

const MarketplacesScreen = () => {
	return (
		<>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow />
			</Header>

			<FlatList
				data={Marketplaces}
				keyExtractor={item => item.value}
				renderItem={({ item }) => (
					<Link
						key={item.value}
						href={`/(tabs)/pazaryerleri/${item.value}`}
						asChild
					>
						<AppTouchableOpacity className="py-1 h-16 bg-background justify-center items-center rounded-lg border border-border">
							<item.Icon
								scaleX={1.6}
								scaleY={1.6}
							/>
						</AppTouchableOpacity>
					</Link>
				)}
				contentContainerStyle={{ padding: 8, gap: 8 }}
			/>
		</>
	);
};

export default MarketplacesScreen;
