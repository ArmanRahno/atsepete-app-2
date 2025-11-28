import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import formatPrice from "@/lib/formatPrice";
import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import findMarketplaceLabel from "@/lib/findMarketplaceLabel";
import findCategoryLabel from "@/lib/findCategoryLabel";
import { router } from "expo-router";
import ReviewStars from "./carousels/ReviewStars";
import ItemListener from "./item/ItemListener";
import ShareDialog from "./item/ShareDialog";
import { Undo2 } from "lucide-react-native";
import { lightForeground } from "@/constants/Colors";

interface Props {
	item: Item;
	type: "INDIRIMLER" | "URUNLER";
}

export default function ReviewScreenPriceCard({ item, type }: Props) {
	const previousPrice = item.price_history?.[item.price_history.length - 2]?.price;
	const discount = Math.round(item.last_price_action_percent_magnitude);

	return (
		<View className="gap-3">
			<Text className="text-lg font-medium">{item.name}</Text>

			<View className="flex-row items-center gap-4">
				<View className="border border-border p-2 overflow-hidden w-28 h-28 rounded-lg">
					<Image
						source={{ uri: item.image_link }}
						style={{ width: "100%", height: "100%", resizeMode: "contain" }}
					/>
				</View>

				<View className="flex-1 gap-3">
					<View>
						<TouchableOpacity
							onPress={() => {
								router.push(`/(tabs)/pazaryerleri/${item.marketplace}`);
							}}
						>
							<Text className="text-lg font-semibold">
								{findMarketplaceLabel(item.marketplace)} Ürünleri
							</Text>
						</TouchableOpacity>

						<View className="flex-row">
							<TouchableOpacity
								onPress={() => {
									router.push(`/(tabs)/kategoriler/${item.category}`);
								}}
							>
								<Text className="text-muted-foreground capitalize">
									{findCategoryLabel(item.category)}
									{", "}
								</Text>
							</TouchableOpacity>
							<Text className="text-muted-foreground">
								{getFormattedTimeDifference(item.last_price_action_date_time)}
							</Text>
						</View>
					</View>

					{item.rating && (
						<View className="flex-row items-center gap-2">
							<ReviewStars
								value={item.rating}
								size={16}
							/>
							<Text className="font-medium text-lg leading-tight">{item.rating}</Text>
						</View>
					)}
				</View>
			</View>

			<View className="justify-between flex-row py-2">
				<View>
					{(!!previousPrice || !!discount) && (
						<View className="flex-row items-center gap-2">
							{!!previousPrice && (
								<Text className="line-through text-lg font-medium text-destructive">
									₺{formatPrice(previousPrice)}
								</Text>
							)}
							{!!discount && (
								<Text className="text-primary text-lg font-semibold">
									%{discount}
								</Text>
							)}
						</View>
					)}
					<Text className="font-bold text-2xl leading-6">
						₺{formatPrice(item.last_price)}
					</Text>
				</View>

				<ItemListener
					item={item}
					className="px-6 py-2 h-9"
				/>
			</View>

			<View className="flex-row gap-3">
				<TouchableOpacity
					className="flex-1 px-6 py-2 h-9 rounded bg-primary justify-center items-center"
					onPress={() => Linking.openURL(item.link)}
				>
					<Text className="text-primary-foreground font-semibold">Ürünü İncele</Text>
				</TouchableOpacity>

				<ShareDialog
					shareMessage={item.name}
					shareUrl={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/${
						type === "INDIRIMLER" ? "indirimler" : "urunler"
					}/${item.url_slug}`}
				/>
			</View>

			<TouchableOpacity
				className="border border-border px-3 py-2 w-full flex-row items-center justify-center gap-1.5 rounded"
				onPress={() =>
					router.push(
						`/${type === "INDIRIMLER" ? "indirimler" : "urunler"}/${item.url_slug}`
					)
				}
			>
				<Undo2
					color={lightForeground}
					size={16}
					strokeWidth={2.3}
				/>
				<Text className="text-foreground font-medium">Ürün Sayfasına Dön</Text>
			</TouchableOpacity>
		</View>
	);
}
