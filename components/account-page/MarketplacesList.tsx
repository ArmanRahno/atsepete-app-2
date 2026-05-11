import React from "react";
import { FlatList, Text, View } from "react-native";
import Marketplaces from "@/constants/Marketplaces";
import { router } from "expo-router";
import { Card } from "../shad-cn/card";
import MarketplaceListener from "../MarketplaceListener";

type MarketplacesListProps = {
	marketplaces: string[];
	onRemoveMarketplace: (marketplace: string) => void;
};

export default function MarketplacesList({
	marketplaces,
	onRemoveMarketplace
}: MarketplacesListProps) {
	return (
		<FlatList
			data={marketplaces}
			keyExtractor={m => m}
			renderItem={({ item }) => {
				const MarketplaceIcon = Marketplaces.find(m => m.value === item)?.Icon;

				return (
					<Card
						key={item}
						className="px-6 py-3 flex-row gap-3 justify-between items-center"
					>
						{MarketplaceIcon && (
							<View className="h-10 w-32 items-center justify-center overflow-hidden rounded-lg bg-white px-3 py-2">
								<MarketplaceIcon
									onPress={() => router.push(`/pazaryerleri/${item}`)}
									style={{
										transform: [{ scale: 1.18 }]
									}}
								/>
							</View>
						)}

						<MarketplaceListener
							className="rounded-[0.65rem] px-4 py-2"
							marketplace={item}
							onListenerSuccess={() => onRemoveMarketplace(item)}
							size={24}
							is_user_subscribed
						/>
					</Card>
				);
			}}
			ListEmptyComponent={
				<Text className="text-destructive text-center mt-6 text-lg font-bold">
					Alarm eklediğiniz pazaryeri bulunmamaktadır.
				</Text>
			}
			contentContainerClassName="p-2 gap-2"
		/>
	);
}
