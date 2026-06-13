import React from "react";
import { FlatList, Text, View } from "react-native";
import Marketplaces from "@/constants/Marketplaces";
import { router } from "expo-router";
import MarketplaceListener from "../MarketplaceListener";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useThemePalette } from "@/hooks/useThemePalette";
import { ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import getMarketplaceCardHue from "@/lib/getMarketplaceCardHue";

type MarketplacesListProps = {
	marketplaces: string[];
	onRemoveMarketplace: (marketplace: string) => void;
};

export default function MarketplacesList({
	marketplaces,
	onRemoveMarketplace
}: MarketplacesListProps) {
	const { colors, isDark } = useThemePalette();
	const cardBackgroundColor = isDark ? "#1E1914" : "#FFFDF7";

	return (
		<FlatList
			data={marketplaces}
			keyExtractor={m => m}
			renderItem={({ item }) => {
				const marketplace = Marketplaces.find(m => m.value === item);
				const MarketplaceIcon = marketplace?.Icon;

				return (
					<View
						key={item}
						className="h-[72px] flex-row items-center overflow-hidden rounded-lg border border-border px-6 py-3"
						style={{
							backgroundColor: cardBackgroundColor,
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: isDark ? 0.22 : 0.06,
							shadowRadius: 4,
							elevation: 1
						}}
					>
						<LinearGradient
							pointerEvents="none"
							colors={getMarketplaceCardHue(marketplace?.value, isDark)}
							locations={[0, 0.54, 1]}
							start={{ x: 0, y: 0.5 }}
							end={{ x: 1, y: 0.5 }}
							style={{
								position: "absolute",
								left: 0,
								top: 0,
								bottom: 0,
								width: "68%",
								borderTopLeftRadius: 8,
								borderBottomLeftRadius: 8
							}}
						/>
						<AppTouchableOpacity
							onPress={() => router.push(`/pazaryerleri/${item}`)}
							className="h-full flex-1 flex-row items-center justify-between pr-3"
						>
							<View
								className="h-10 justify-center items-start"
								style={{
									minWidth: 124
								}}
							>
								{MarketplaceIcon && (
									<MarketplaceIcon
										style={{
											transformOrigin: "left center",
											transform: [{ scale: 1.24 }]
										}}
									/>
								)}
							</View>

							<View
								className="h-8 w-8 items-center justify-center rounded-full"
								style={{ backgroundColor: isDark ? "#2A241E" : "#F1E8DD" }}
							>
								<ChevronRight
									size={17}
									color={colors.mutedForeground}
									strokeWidth={2.4}
								/>
							</View>
						</AppTouchableOpacity>

						<MarketplaceListener
							className="ml-2 w-12 h-10 rounded-[0.65rem] px-0 py-0"
							marketplace={item}
							onListenerSuccess={finalState => {
								if (!finalState) onRemoveMarketplace(item);
							}}
							size={22}
							is_user_subscribed
						/>
					</View>
				);
			}}
			ListEmptyComponent={
				<Text className="text-destructive text-center mt-6 text-lg font-bold">
					Alarm eklediğiniz pazaryeri bulunmamaktadır.
				</Text>
			}
			contentContainerStyle={{ padding: 12, gap: 8 }}
		/>
	);
}
