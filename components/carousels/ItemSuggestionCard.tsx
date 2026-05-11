import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import React from "react";
import { View, Text, Image } from "react-native";
import { Card } from "../shad-cn/card";
import Marketplaces from "@/constants/Marketplaces";
import formatPrice from "@/lib/formatPrice";
import { Pressable } from "react-native";
import { Router, useRouter } from "expo-router";
import getPreviousPrice from "@/lib/getPreviousPrice";
import { useThemePalette } from "@/hooks/useThemePalette";
import { semanticGreen, semanticRed } from "@/constants/SemanticColors";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { cn } from "@/lib/utils";

type ItemSuggestionCardProps = {
	item: Item;
};

export default function ItemSuggestionCard(props: ItemSuggestionCardProps) {
	const router = useRouter();
	const { isDark } = useThemePalette();
	const red = semanticRed(isDark);
	const green = semanticGreen(isDark);

	const {
		image_link,
		last_price,
		marketplace,
		name,
		last_price_action_percent_magnitude,
		price_history,
		last_price_action_date_time,
		url_slug,
		is_cheapest,
		is_discount_unavailable,
		discount_unavailability_cause
	} = props.item;

	const MarketplaceIcon = Marketplaces.find(m => {
		return m.value === marketplace;
	})?.Icon;
	const sortedPriceHistory = [...price_history]
		.filter(pricePoint => !!pricePoint && !!pricePoint.date_time)
		.sort(
			(a, b) =>
				new Date(String(a.date_time)).getTime() - new Date(String(b.date_time)).getTime()
		);
	const previousPrice = getPreviousPrice(sortedPriceHistory);
	const discount = Math.round(last_price_action_percent_magnitude);
	const isUnavailable = !!is_discount_unavailable && !!discount_unavailability_cause;
	const statusColor = isUnavailable ? red : green;

	return (
		<Card className="m-1 h-[338px] w-[164px] min-w-[164px] max-w-[164px] overflow-hidden bg-card p-0">
			<View className="relative w-full aspect-square overflow-hidden rounded-t-md bg-white p-3">
				<View className="absolute left-2 top-2 z-[1]">
					<Text className="rounded-full border border-black/10 bg-foreground px-2 py-1 text-xs font-bold leading-tight text-background dark:border-white/10">
						-%{discount}
					</Text>
				</View>
				{!!is_cheapest && (
					<View className="absolute right-2 top-2 z-[1]">
						<Text className="rounded-full border border-black/10 bg-foreground px-2 py-1 text-[11px] font-bold leading-tight text-background dark:border-white/10">
							En Ucuz
						</Text>
					</View>
				)}

				<ToItemPagePressable
					router={router}
					url_slug={url_slug}
					fill
				>
					<Image
						source={{ uri: image_link }}
						className="w-full h-full"
						resizeMode="contain"
					/>
				</ToItemPagePressable>
			</View>
			<View className="flex-1 p-2">
				<View className="flex-row items-center truncate gap-2">
					{marketplace && MarketplaceIcon ? (
						<ToMarketplacePagePressable
							marketplace={marketplace}
							router={router}
						>
							<View className="h-7 min-w-16 items-center justify-center overflow-hidden rounded-lg bg-white px-2 py-1">
								<MarketplaceIcon />
							</View>
						</ToMarketplacePagePressable>
					) : null}
					<View className="w-[1px] h-4 bg-border" />

					<Text
						className="min-w-0 flex-1 text-xs text-muted-foreground"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{getFormattedTimeDifference(last_price_action_date_time)}
					</Text>
				</View>

				<View className="mt-2">
					<Text className="text-foreground text-lg font-bold leading-tight">
						₺{formatPrice(last_price)}
					</Text>
					{typeof previousPrice === "number" && (
						<Text
							className="line-through text-sm font-medium leading-tight"
							style={{ color: red }}
						>
							₺{formatPrice(previousPrice)}
						</Text>
					)}
				</View>

				<ToItemPagePressable
					router={router}
					url_slug={url_slug}
				>
					<Text
						className="min-h-10 text-sm text-primary font-medium leading-5"
						numberOfLines={2}
					>
						{name}
					</Text>
				</ToItemPagePressable>

				<View
					className={cn(
						"mt-auto flex-row items-center gap-1.5 rounded-lg border px-2 py-1.5",
						isUnavailable
							? "border-red-700/25 bg-red-700/10 dark:border-red-500/20 dark:bg-red-500/20"
							: "border-emerald-700/30 bg-emerald-700/20 dark:border-emerald-500/20 dark:bg-emerald-500/20"
					)}
				>
					{isUnavailable ? (
						<XCircle
							size={13}
							color={statusColor}
						/>
					) : (
						<CheckCircle2
							size={13}
							color={statusColor}
						/>
					)}
					<Text
						className="min-w-0 flex-1 text-[11px] leading-4"
						style={{ color: statusColor, fontFamily: "Roboto_500Medium" }}
						numberOfLines={2}
					>
						{isUnavailable ? discount_unavailability_cause : "Fırsat hala devam ediyor"}
					</Text>
				</View>
			</View>
		</Card>
	);
}

const ToItemPagePressable = ({
	children,
	router,
	url_slug,
	fill = false
}: {
	children: React.ReactNode;
	router: Router;
	url_slug: string;
	fill?: boolean;
}) => {
	return (
		<Pressable
			className={fill ? "h-full w-full" : undefined}
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
