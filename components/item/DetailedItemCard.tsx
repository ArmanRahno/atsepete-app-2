import React from "react";
import { View, Text, Image } from "react-native";
import ItemPriceCard from "./ItemPriceCard";
import { PriceChart } from "./PriceChart";
import { Calendar } from "lucide-react-native";
import { lightMutedForeground } from "@/constants/Colors";
import ItemSuggestionsCarousel from "../carousels/ItemSuggestionsCarousel";
import Markdown from "react-native-markdown-display";
import ItemReviewsCarousel from "../carousels/ItemReviewsCarousel";
import { Card } from "../shad-cn/card";
import CheapestBadge from "./CheapestBadge";

type DetailedItemCardProps = {
	item: Item;
};

const MAX_DISPLAYED_DATA_POINTS = 20;

export default function DetailedItemCard({ item }: DetailedItemCardProps) {
	const priceHistorySubset = item.price_history.slice(
		Math.max(0, item.price_history.length - MAX_DISPLAYED_DATA_POINTS)
	);

	return (
		<>
			<Text className="text-xl font-semibold mb-4">{item.name}</Text>

			<View className="relative w-full aspect-square bg-white rounded-lg overflow-hidden mb-4">
				<Image
					source={{ uri: item.image_link }}
					className="w-full h-full"
					resizeMode="contain"
				/>

				{item.is_cheapest && <CheapestBadge />}
			</View>

			<ItemPriceCard item={item} />

			<View className="mt-4">
				{priceHistorySubset.map((pricePoint, index) => {
					const dateText = new Date(pricePoint.date_time).toLocaleDateString("tr-TR", {
						year: "numeric",
						month: "short",
						day: "numeric"
					});

					return (
						<View
							key={index}
							className="flex-row items-center space-x-2 mb-2 gap-2"
						>
							<Calendar
								size={16}
								color={lightMutedForeground}
							/>
							<Text className="text-foreground font-medium">{dateText}</Text>
							<Text className="text-muted-foreground">→</Text>
							<Text className="text-foreground font-medium">₺{pricePoint.price}</Text>
						</View>
					);
				})}
			</View>

			<PriceChart data={item.price_history} />

			{item.product_description?.length ? (
				<View className="mt-6">
					<Text className="text-lg font-semibold mb-2">Ürün Açıklaması</Text>
					<Markdown>{item.product_description}</Markdown>
				</View>
			) : null}

			<ItemSuggestionsCarousel suggestions={item.suggestions} />

			<ItemReviewsCarousel
				slug={item.url_slug}
				rating={item.rating}
				reviews={item.reviews}
				type="INDIRIMLER"
			/>

			{item.ai_review && (
				<Card className="bg-secondary p-3 gap-2 mt-4">
					<Text className="text-secondary-foreground font-semibold">
						Yapay Zeka Değerlendirmeler Özeti:
					</Text>
					<Text className="text-secondary-foreground">{item.ai_review}</Text>
				</Card>
			)}
		</>
	);
}
