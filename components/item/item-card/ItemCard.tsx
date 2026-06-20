import Categories from "@/constants/Categories";
import Marketplaces from "@/constants/Marketplaces";
import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import formatPrice from "@/lib/formatPrice";
import getPreviousPrice from "@/lib/getPreviousPrice";
import { cn } from "@/lib/utils";
import { Href, Link } from "expo-router";
import { CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ClassNameValue } from "tailwind-merge";
import ItemListener from "../ItemListener";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemePalette } from "@/hooks/useThemePalette";
import { semanticGreen, semanticRed } from "@/constants/SemanticColors";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type HomepageFeedItem = Item & {
	is_user_subscribed?: boolean;
	isUserNotificationActive?: boolean;
};

export type ItemCardProps = {
	item: HomepageFeedItem;
	className?: ClassNameValue;
	displayItemListener?: boolean;
	detailHrefPrefix?: "/indirimler" | "/urunler";
	detailHref?: Href;
	onListenerTrigger?: (itemId: string, finalState: boolean) => void;
};

const fontStyles = StyleSheet.create({
	regular: {
		fontFamily: "Roboto_400Regular"
	},
	medium: {
		fontFamily: "Roboto_500Medium"
	},
	bold: {
		fontFamily: "Roboto_700Bold"
	}
});

export default function ItemCard({
	item,
	className,
	displayItemListener = false,
	detailHrefPrefix = "/indirimler",
	detailHref: detailHrefOverride,
	onListenerTrigger
}: ItemCardProps) {
	const { colors, isDark } = useThemePalette();
	const red = semanticRed(isDark);
	const green = semanticGreen(isDark);
	const detailHref: Href =
		detailHrefOverride ??
		(detailHrefPrefix === "/urunler"
			? {
					pathname: "/urunler/[slug]",
					params: { slug: item.url_slug }
				}
			: {
					pathname: "/indirimler/[slug]",
					params: { slug: item.url_slug }
				});

	const marketplaceValue = item.marketplace?.toLowerCase();
	const marketplaceMeta = Marketplaces.find(val => val.value === marketplaceValue);
	const marketplaceLabel = marketplaceMeta?.label || item.marketplace;
	const hasMarketplaceIcon = !!marketplaceMeta;
	const MarketplaceIcon = marketplaceMeta?.Icon;

	const categoryMeta = item.category ? Categories.find(val => val.value === item.category) : null;
	const categoryLabel = categoryMeta?.label || item.category || null;
	const categoryIconName = categoryMeta?.icon || null;

	const marketplaceHref: Href | null =
		item.marketplace && marketplaceValue
			? {
					pathname: "/pazaryerleri/[slug]",
					params: { slug: marketplaceValue }
				}
			: null;

	const categoryHref: Href | null = item.category
		? {
				pathname: "/kategoriler/[slug]",
				params: { slug: item.category.toLowerCase() }
			}
		: null;

	const sortedPriceHistory = [...item.price_history]
		.filter(pricePoint => !!pricePoint && !!pricePoint.date_time)
		.sort(
			(a, b) =>
				new Date(String(a.date_time)).getTime() - new Date(String(b.date_time)).getTime()
		);

	const previousPrice = getPreviousPrice(sortedPriceHistory);
	const currentPrice = item.last_price;

	const now = Date.now();
	const recent30History = sortedPriceHistory.filter(pricePoint => {
		const pointTime = new Date(String(pricePoint.date_time)).getTime();
		return now - pointTime <= THIRTY_DAYS_MS;
	});

	const recent30LowestPoint =
		recent30History.length > 0
			? recent30History.reduce((min, point) => (point.price < min.price ? point : min))
			: null;

	const isRecent30Low = !!recent30LowestPoint && currentPrice <= recent30LowestPoint.price;

	const changeAmountFromPrevious =
		typeof previousPrice === "number" ? currentPrice - previousPrice : null;

	const changeIsDown = changeAmountFromPrevious !== null && changeAmountFromPrevious < 0;
	const changeIsUp = changeAmountFromPrevious !== null && changeAmountFromPrevious > 0;

	const lastActionPercent =
		typeof item.last_price_action_percent_magnitude === "number" &&
		item.last_price_action_percent_magnitude > 0
			? Math.round(item.last_price_action_percent_magnitude)
			: null;

	const initListenerActive = !!(item.is_user_subscribed || item.isUserNotificationActive);
	const isUnavailable = !!item.is_discount_unavailable && !!item.discount_unavailability_cause;
	const statusColor = isUnavailable ? red : green;

	const cheapestChip =
		item.is_cheapest || isRecent30Low ? (
			<View className="min-h-7 items-center justify-center rounded-full bg-foreground px-2.5 py-1.5">
				<Text
					className="text-center text-[11px] leading-4 text-background"
					style={fontStyles.bold}
				>
					En Ucuz
				</Text>
			</View>
		) : null;

	const priceMoveChip =
		changeAmountFromPrevious !== null ? (
			changeIsDown ? (
				<View className="flex-row items-center gap-1.5 rounded-full border border-emerald-700/30 bg-emerald-700/20 px-2.5 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/20">
					<TrendingDown
						size={14}
						color={green}
					/>
					<Text
						className="text-[11px]"
						style={[fontStyles.medium, { color: green }]}
					>
						₺{formatPrice(Math.abs(changeAmountFromPrevious))} düştü
					</Text>
				</View>
			) : changeIsUp ? (
				<View className="flex-row items-center gap-1.5 rounded-full border border-red-700/25 bg-red-700/10 px-2.5 py-1.5 dark:border-red-500/20 dark:bg-red-500/20">
					<TrendingUp
						size={14}
						color={red}
					/>
					<Text
						className="text-[11px]"
						style={[fontStyles.medium, { color: red }]}
					>
						₺{formatPrice(Math.abs(changeAmountFromPrevious))} yükseldi
					</Text>
				</View>
			) : null
		) : null;

	const MetaInfo = () => (
		<View className="min-h-6 min-w-0 flex-1 flex-row items-center gap-2">
			{marketplaceHref && (
				<Link
					href={marketplaceHref}
					asChild
				>
					<Pressable className="shrink-0 flex-row items-center">
						{hasMarketplaceIcon && MarketplaceIcon ? (
							<View className="h-7 min-w-16 items-center justify-center overflow-hidden rounded-lg bg-white px-2">
								<MarketplaceIcon />
							</View>
						) : (
							<Text
								className="text-xs text-muted-foreground"
								style={fontStyles.regular}
								numberOfLines={1}
							>
								{marketplaceLabel}
							</Text>
						)}
					</Pressable>
				</Link>
			)}

			{categoryLabel && marketplaceHref && (
				<Text
					className="text-xs text-muted-foreground/40"
					style={fontStyles.regular}
				>
					•
				</Text>
			)}

			{categoryLabel && categoryHref && (
				<Link
					href={categoryHref}
					asChild
				>
					<Pressable className="flex-row items-center gap-1">
						{categoryIconName ? (
							<IconSymbol
								name={categoryIconName as any}
								size={14}
								color={colors.mutedForeground}
							/>
						) : null}

						<Text
							className="text-xs text-muted-foreground"
							style={fontStyles.regular}
							numberOfLines={1}
						>
							{categoryLabel}
						</Text>
					</Pressable>
				</Link>
			)}

			<Text
				className="text-xs text-muted-foreground/40"
				style={fontStyles.regular}
			>
				•
			</Text>

			<Text
				className="flex-1 text-xs text-muted-foreground"
				style={fontStyles.regular}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{getFormattedTimeDifference(new Date(item.last_price_action_date_time))}
			</Text>
		</View>
	);

	return (
		<View className={cn("rounded-2xl border border-border/70 bg-card p-4", className)}>
			<View className="flex-row gap-4">
				<Link
					href={detailHref}
					asChild
				>
					<Pressable
						className="shrink-0 items-center justify-center"
						style={{
							width: "40%",
							minWidth: 120,
							maxWidth: 172
						}}
					>
						<View
							className="relative overflow-hidden rounded-xl bg-white p-3"
							style={{
								width: "100%",
								aspectRatio: 1,
								justifyContent: "center",
								alignItems: "center"
							}}
						>
							{!!lastActionPercent && (
								<View className="absolute left-2 top-2 z-[2] rounded-full border border-black/10 bg-foreground px-2 py-1 shadow-sm dark:border-white/10">
									<Text
										className="text-xs text-background"
										style={fontStyles.bold}
									>
										-%{lastActionPercent}
									</Text>
								</View>
							)}

							<Image
								source={{ uri: item.image_link }}
								resizeMode="contain"
								style={{
									width: "100%",
									height: "100%"
								}}
							/>
						</View>
					</Pressable>
				</Link>

				<View
					style={{
						width: 1,
						height: "60%",
						alignSelf: "center",
						borderRadius: 1
					}}
					className="bg-border/40"
				/>

				<View
					className="min-w-0 flex-1"
					style={{ minHeight: 136 }}
				>
					<View className="flex-row items-start gap-2">
						<View className="min-w-0 flex-1">
							<MetaInfo />
						</View>
					</View>

					<Link
						href={detailHref}
						asChild
					>
						<Pressable className="mt-2.5">
							<Text
								numberOfLines={2}
								ellipsizeMode="tail"
								className="text-[14px] leading-5 text-foreground"
								style={fontStyles.medium}
							>
								{item.name}
							</Text>
						</Pressable>
					</Link>

					<View className="mt-3 flex-row flex-wrap items-end gap-x-3 gap-y-1">
						<Text
							className="text-2xl text-foreground"
							style={fontStyles.bold}
						>
							₺{formatPrice(currentPrice)}
						</Text>

						{typeof previousPrice === "number" && (
							<Text
								className="text-base"
								style={[
									fontStyles.medium,
									{ color: red, textDecorationLine: "line-through" }
								]}
							>
								₺{formatPrice(previousPrice)}
							</Text>
						)}
					</View>

					<View className="mt-auto flex-row items-end justify-between gap-3 pt-3">
						<View className="min-w-0 flex-1 flex-row flex-wrap gap-2">
							{cheapestChip}
							{priceMoveChip}
						</View>

						{displayItemListener && !!item._id && (
							<ItemListener
								item={item}
								initIsActive={initListenerActive}
								className="h-11 w-11 shrink-0 rounded-xl px-0"
								onListenerSuccess={onListenerTrigger}
							/>
						)}
					</View>

					<View
						className={cn(
							"mt-3 rounded-lg border px-3 py-2.5",
							isUnavailable
								? "border-red-700/25 bg-red-700/10 dark:border-red-500/20 dark:bg-red-500/20"
								: "border-emerald-700/30 bg-emerald-700/20 dark:border-emerald-500/20 dark:bg-emerald-500/20"
						)}
					>
						<View className="flex-row items-center gap-2">
							{isUnavailable ? (
								<XCircle
									size={15}
									color={statusColor}
								/>
							) : (
								<CheckCircle2
									size={15}
									color={statusColor}
								/>
							)}
							<Text
								className="min-w-0 flex-1 text-xs"
								style={[fontStyles.medium, { color: statusColor }]}
								numberOfLines={2}
							>
								{isUnavailable
									? item.discount_unavailability_cause
									: "Fırsat hala devam ediyor"}
							</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
