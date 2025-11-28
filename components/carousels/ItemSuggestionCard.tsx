import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import React from "react";
import { View, Text, Image } from "react-native";
import { Card } from "../shad-cn/card";
import Marketplaces from "@/constants/Marketplaces";
import formatPrice from "@/lib/formatPrice";
import { Pressable } from "react-native";
import { Router, useRouter } from "expo-router";

type ItemSuggestionCardProps = {
	item: Item;
};

export default function ItemSuggestionCard(props: ItemSuggestionCardProps) {
	const router = useRouter();

	const {
		image_link,
		last_price,
		marketplace,
		name,
		last_price_action_percent_magnitude,
		price_history,
		last_price_action_date_time,
		url_slug
	} = props.item;

	const MarketplaceIcon = Marketplaces.find(m => {
		return m.value === marketplace;
	})?.Icon;

	return (
		<Card className="w-[160px] min-w-[160px] max-w-[160px] p-1.5 m-1 overflow-hidden">
			<View className="relative w-full aspect-square rounded-t-md overflow-hidden">
				<View className="absolute top-1 right-1 z-[1]">
					<Text className="bg-primary text-primary-foreground border border-border px-2 py-1 text-base font-semibold rounded leading-tight">
						%{Math.round(last_price_action_percent_magnitude)}
					</Text>
				</View>

				<View className="p-1">
					<ToItemPagePressable
						router={router}
						url_slug={url_slug}
					>
						<Image
							source={{ uri: image_link }}
							className="w-full h-full"
							resizeMode="contain"
						/>
					</ToItemPagePressable>
				</View>
			</View>
			<View className="p-2">
				<Text className="text-destructive line-through text-sm font-medium leading-tight">
					₺{formatPrice(price_history[price_history.length - 2].price)}
				</Text>
				<Text className="text-black text-lg font-bold leading-tight">
					₺{formatPrice(last_price)}
				</Text>

				<View className="flex-row items-center my-2 truncate gap-2">
					{marketplace && MarketplaceIcon ? (
						<ToMarketplacePagePressable
							marketplace={marketplace}
							router={router}
						>
							<MarketplaceIcon />
						</ToMarketplacePagePressable>
					) : null}
					<View className="w-[1px] h-4 bg-border" />

					<Text className="text-xs text-muted-foreground">
						{getFormattedTimeDifference(last_price_action_date_time)}
					</Text>
				</View>

				<ToItemPagePressable
					router={router}
					url_slug={url_slug}
				>
					<Text
						className="text-sm text-blue-600 font-medium"
						numberOfLines={2}
					>
						{name}
					</Text>
				</ToItemPagePressable>
			</View>
		</Card>
	);
}

const ToItemPagePressable = ({
	children,
	router,
	url_slug
}: {
	children: React.ReactNode;
	router: Router;
	url_slug: string;
}) => {
	return (
		<Pressable
			onPress={() => {
				router.push(`/indirimler/${url_slug}`);
			}}
		>
			{children}
		</Pressable>
	);
};

const ToMarketplacePagePressable = ({
	children,
	router,
	marketplace
}: {
	children: React.ReactNode;
	router: Router;
	marketplace: string;
}) => {
	return (
		<Pressable
			onPress={() => {
				router.push(`/pazaryerleri/${marketplace}`);
			}}
		>
			{children}
		</Pressable>
	);
};
