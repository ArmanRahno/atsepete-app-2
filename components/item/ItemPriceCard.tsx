import formatPrice from "@/lib/formatPrice";
import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import findMarketplaceLabel from "@/lib/findMarketplaceLabel";
import { Link } from "expo-router";
import findCategoryLabel from "@/lib/findCategoryLabel";
import ShareDialog from "./ShareDialog";
import ItemListener from "./ItemListener";
import { Card } from "../shad-cn/card";

type ItemPriceCardProps = {
	item: Item;
	onPressMarketplace?: (marketplace: string) => void;
	onPressCategory?: (category: string) => void;
};

export default function ItemPriceCard({ item }: ItemPriceCardProps) {
	const previousPrice = item.price_history?.[item.price_history.length - 2]?.price ?? null;
	const lastPrice = item.last_price;
	const discount = Math.round(item.last_price_action_percent_magnitude);

	return (
		<Card className="bg-background rounded-lg p-4 my-4 shadow-sm">
			<Link
				href={`/pazaryerleri/${item.marketplace}`}
				className="flex-none text-xl font-semibold text-foreground leading-tight"
			>
				{findMarketplaceLabel(item.marketplace)} Ürünleri
			</Link>

			<View className="absolute top-4 right-4 gap-2">
				<Text className="bg-primary text-white border border-border px-3 py-1.5 text-base font-semibold rounded leading-tight">
					%{discount}
				</Text>
				<ItemListener
					className="static px-3 py-1.5 z-[1]"
					item={item}
				/>
			</View>

			<View className="flex-row flex-wrap">
				<Link
					className="flex-shrink text-muted-foreground leading-tight"
					href={`/kategoriler/${item.category}`}
					textBreakStrategy="simple"
					android_hyphenationFrequency="none"
					style={{ fontFamily: "Roboto_500Medium" }}
				>
					{findCategoryLabel(item.category)}
				</Link>
				<Text
					className="flex-shrink text-muted-foreground leading-tight"
					textBreakStrategy="simple"
					android_hyphenationFrequency="none"
					ellipsizeMode="tail"
					style={{ fontFamily: "Roboto_500Medium" }}
				>
					{", "}
					{getFormattedTimeDifference(item.last_price_action_date_time)}
				</Text>
			</View>

			<View className="mt-4 gap-0.5">
				{previousPrice !== null && (
					<Text className="text-xl font-medium text-red-500 line-through leading-5">
						₺{formatPrice(previousPrice)}
					</Text>
				)}
				<Text className="text-3xl font-bold text-emerald-600 leading-8">
					₺{formatPrice(lastPrice)}
				</Text>
			</View>

			<View className="mt-4 gap-1">
				{item.is_discount_unavailable && item.discount_unavailability_cause && (
					<Text className="text-destructive font-semibold leading-tight">
						{item.discount_unavailability_cause}
					</Text>
				)}

				<View className="flex-row gap-2">
					<TouchableOpacity
						onPress={() => {
							Linking.openURL(item.link);
						}}
						className="flex-1 items-center bg-primary px-4 py-2 h-9 rounded"
					>
						<Text className="text-white font-semibold">Ürünü İncele</Text>
					</TouchableOpacity>

					<ShareDialog
						shareMessage={item.name}
						shareUrl={`https://atsepete.net/indirimler/${item.url_slug}`}
					/>
				</View>
			</View>
		</Card>
	);
}
