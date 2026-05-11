import Categories from "@/constants/Categories";
import Marketplaces from "@/constants/Marketplaces";
import formatPrice from "@/lib/formatPrice";
import getFormattedTimeDifference from "@/lib/getFormattedTimeDifference";
import getPreviousPrice from "@/lib/getPreviousPrice";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Linking, StyleSheet, Pressable } from "react-native";
import { Href, Link } from "expo-router";
import ShareDialog from "./ShareDialog";
import ItemListener from "./ItemListener";
import AppTouchableOpacity from "../AppTouchableOpacity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemePalette } from "@/hooks/useThemePalette";
import { semanticGreen, semanticRed } from "@/constants/SemanticColors";

const REFERRER_CODE_KEY = "user-referrer-code";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type ItemPriceCardProps = {
	item?: Item | null;
	onPressMarketplace?: (marketplace: string) => void;
	onPressCategory?: (category: string) => void;
};

const styles = StyleSheet.create({
	regular: {
		fontFamily: "Roboto_400Regular"
	},
	medium: {
		fontFamily: "Roboto_500Medium"
	},
	bold: {
		fontFamily: "Roboto_700Bold"
	},
	disclaimer: {
		fontFamily: "Roboto_400Regular",
		textAlign: "justify"
	}
});

export default function ItemPriceCard({ item }: ItemPriceCardProps) {
	const { colors, isDark } = useThemePalette();
	const red = semanticRed(isDark);
	const green = semanticGreen(isDark);

	if (!item) return null;

	const marketplaceValue =
		typeof item.marketplace === "string" ? item.marketplace.toLowerCase() : undefined;

	const marketplaceMeta = Marketplaces.find(val => val.value === marketplaceValue);
	const MarketplaceIcon = marketplaceMeta?.Icon;

	const categoryMeta = item.category ? Categories.find(val => val.value === item.category) : null;

	const categoryLabel = categoryMeta?.label || item.category || null;
	const categoryIconName = categoryMeta?.icon || null;

	const sortedPriceHistory = useMemo(() => {
		return [...item.price_history]
			.filter(pricePoint => !!pricePoint && !!pricePoint.date_time)
			.sort(
				(a, b) =>
					new Date(String(a.date_time)).getTime() -
					new Date(String(b.date_time)).getTime()
			);
	}, [item.price_history]);

	const previousPrice = getPreviousPrice(sortedPriceHistory);
	const currentPrice = item.last_price;

	const recent30History = useMemo(() => {
		const now = Date.now();
		return sortedPriceHistory.filter(pricePoint => {
			const pointTime = new Date(String(pricePoint.date_time)).getTime();
			return now - pointTime <= THIRTY_DAYS_MS;
		});
	}, [sortedPriceHistory]);

	const recent30LowestPoint =
		recent30History.length > 0
			? recent30History.reduce((min, point) => (point.price < min.price ? point : min))
			: null;

	const isRecent30Low = !!recent30LowestPoint && currentPrice <= recent30LowestPoint.price;

	const currentVsRecent30LowestPercent =
		recent30LowestPoint && recent30LowestPoint.price > 0
			? ((currentPrice - recent30LowestPoint.price) / recent30LowestPoint.price) * 100
			: null;

	const changeAmountFromPrevious =
		typeof previousPrice === "number" ? currentPrice - previousPrice : null;

	const changeIsDown = changeAmountFromPrevious !== null && changeAmountFromPrevious < 0;
	const changeIsUp = changeAmountFromPrevious !== null && changeAmountFromPrevious > 0;

	const lastActionPercent =
		typeof item.last_price_action_percent_magnitude === "number" &&
		item.last_price_action_percent_magnitude > 0
			? Math.round(item.last_price_action_percent_magnitude)
			: null;
	const isUnavailable = !!item.is_discount_unavailable && !!item.discount_unavailability_cause;
	const statusColor = isUnavailable ? red : green;

	const [shareUrl, setShareUrl] = useState(`https://atsepete.net/indirimler/${item.url_slug}`);

	useEffect(() => {
		(async () => {
			try {
				const referrerCode = await AsyncStorage.getItem(REFERRER_CODE_KEY);
				const baseUrl = `https://atsepete.net/indirimler/${item.url_slug}`;

				const finalUrl = referrerCode
					? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}r=${encodeURIComponent(
							referrerCode
						)}`
					: baseUrl;

				setShareUrl(finalUrl);
			} catch {
				setShareUrl(`https://atsepete.net/indirimler/${item.url_slug}`);
			}
		})();
	}, [item.url_slug]);

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

	return (
		<View className="rounded-[24px] bg-card p-4">
			<View className="flex-row items-center justify-between gap-3">
				{marketplaceHref ? (
					<Link
						href={marketplaceHref}
						asChild
					>
						<Pressable className="h-10 w-36 items-center justify-center overflow-hidden rounded-lg bg-white px-4 py-2">
							{MarketplaceIcon ? (
								<View
									className="items-center justify-center"
									style={{
										width: 124,
										height: 28,
										transform: [{ scale: 1.12 }]
									}}
								>
									<MarketplaceIcon />
								</View>
							) : (
								<Text
									className="text-base text-foreground"
									style={styles.medium}
								>
									{marketplaceMeta?.label || item.marketplace}
								</Text>
							)}
						</Pressable>
					</Link>
				) : (
					<View />
				)}

				{!!lastActionPercent && (
					<View
						className="border border-black/10 bg-foreground px-3.5 py-2 dark:border-white/10"
						style={{ borderRadius: 999 }}
					>
						<Text
							className="text-base text-background"
							style={styles.bold}
						>
							-%{lastActionPercent}
						</Text>
					</View>
				)}
			</View>

			<View className="mt-2 flex-row flex-wrap items-center gap-x-2 gap-y-1">
				{categoryLabel && categoryHref && (
					<>
						<Link
							href={categoryHref}
							asChild
						>
							<Pressable className="flex-row items-center gap-1.5">
								{categoryIconName ? (
									<IconSymbol
										name={categoryIconName as any}
										size={20}
										color={colors.mutedForeground}
									/>
								) : null}

								<Text
									className="text-[14px] text-muted-foreground"
									style={styles.medium}
								>
									{categoryLabel}
								</Text>
							</Pressable>
						</Link>

						<Text
							className="text-[14px] text-muted-foreground"
							style={styles.regular}
						>
							•
						</Text>
					</>
				)}

				<Text
					className="text-[14px] text-muted-foreground"
					style={styles.regular}
				>
					{getFormattedTimeDifference(item.last_price_action_date_time)}
				</Text>
			</View>

			<View className="mt-4 rounded-[20px] bg-secondary/60 p-4">
				<View className="absolute right-4 top-4 z-[2]">
					<ItemListener
						item={item}
						initIsActive={item.isUserNotificationActive}
						className="rounded-xl px-4 py-2"
					/>
				</View>

				<View>
					<Text
						className="text-sm text-muted-foreground"
						style={styles.regular}
					>
						Güncel fiyat
					</Text>

					<Text
						className="mt-1 text-3xl text-foreground"
						style={styles.bold}
					>
						₺{formatPrice(currentPrice)}
					</Text>
				</View>

				{typeof previousPrice === "number" && (
					<View className="mt-2 flex-row items-center gap-2">
						<Text
							className="text-sm text-muted-foreground"
							style={styles.regular}
						>
							Önce
						</Text>

						<Text
							className="text-lg"
							style={[
								styles.medium,
								{ color: red, textDecorationLine: "line-through" }
							]}
						>
							₺{formatPrice(previousPrice)}
						</Text>
					</View>
				)}

				{(recent30History.length > 0 || changeAmountFromPrevious !== null) && (
					<View className="mt-3 gap-2">
						{recent30History.length > 0 &&
							(isRecent30Low ? (
								<View
									className="self-start border border-emerald-700/30 bg-emerald-700/20 px-2.5 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/20"
									style={{ borderRadius: 8 }}
								>
									<View className="flex-row items-center gap-2">
										<TrendingDown
											size={16}
											color={green}
										/>
										<Text
											className="text-sm"
											style={[styles.medium, { color: green }]}
										>
											Son 30 gündeki en düşük fiyat
										</Text>
									</View>
								</View>
							) : currentVsRecent30LowestPercent !== null &&
							  currentVsRecent30LowestPercent > 0 ? (
								<Text
									className="text-sm text-muted-foreground"
									style={styles.regular}
								>
									Güncel fiyat, son 30 günde görülen en düşük seviyenin yaklaşık{" "}
									<Text
										className="text-foreground"
										style={styles.bold}
									>
										%{Math.round(currentVsRecent30LowestPercent)}
									</Text>{" "}
									üzerinde
								</Text>
							) : null)}

						{changeAmountFromPrevious !== null &&
							(changeIsDown ? (
								<View
									className="self-start border border-emerald-700/30 bg-emerald-700/20 px-2.5 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/20"
									style={{ borderRadius: 8 }}
								>
									<View className="flex-row items-center gap-2">
										<TrendingDown
											size={16}
											color={green}
										/>
										<Text
											className="text-sm"
											style={[styles.medium, { color: green }]}
										>
											Son kayda göre ₺
											{formatPrice(Math.abs(changeAmountFromPrevious))} düştü
										</Text>
									</View>
								</View>
							) : changeIsUp ? (
								<View
									className="self-start border border-red-700/25 bg-red-700/10 px-2.5 py-1.5 dark:border-red-500/20 dark:bg-red-500/20"
									style={{ borderRadius: 8 }}
								>
									<View className="flex-row items-center gap-2">
										<TrendingUp
											size={16}
											color={red}
										/>
										<Text
											className="text-sm"
											style={[styles.medium, { color: red }]}
										>
											Son kayda göre ₺
											{formatPrice(Math.abs(changeAmountFromPrevious))}{" "}
											yükseldi
										</Text>
									</View>
								</View>
							) : null)}
					</View>
				)}
			</View>

			<View
				className={`mt-4 rounded-lg border px-3 py-2 ${
					isUnavailable
						? "border-red-700/25 bg-red-700/10 dark:border-red-500/20 dark:bg-red-500/20"
						: "border-emerald-700/30 bg-emerald-700/20 dark:border-emerald-500/20 dark:bg-emerald-500/20"
				}`}
			>
				<View className="flex-row items-center gap-2">
					{isUnavailable ? (
						<XCircle
							size={16}
							color={statusColor}
						/>
					) : (
						<CheckCircle2
							size={16}
							color={statusColor}
						/>
					)}
					<Text
						className="min-w-0 flex-1 text-sm"
						style={[styles.medium, { color: statusColor }]}
					>
						{isUnavailable
							? item.discount_unavailability_cause
							: "Fırsat hala devam ediyor"}
					</Text>
				</View>
			</View>

			<View className="mt-4 flex-row gap-2">
				<ShareDialog
					shareMessage={item.name}
					shareUrl={shareUrl}
					pressableClassName="h-14"
					iconSize={24}
				/>

				<AppTouchableOpacity
					onPress={() => {
						Linking.openURL(item.link);
					}}
					className="h-14 flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2"
				>
					<Text
						className="text-white text-lg"
						style={styles.bold}
					>
						Ürünü İncele
					</Text>
				</AppTouchableOpacity>
			</View>

			<Text
				className="mt-4 text-[11px] leading-4 text-muted-foreground"
				style={styles.disclaimer}
			>
				AtSepete, Amazon, HepsiBurada, Trendyol, N11, MediaMarkt, Pazarama, İdefix, D&R,
				Çiçeksepeti, Türkcell Pasaj, Koçtaş, PttAVM, Avansas, Teknosa ve diğer markaların
				resmi temsilcisi değildir. Belirtilen markalar ve diğerleri ilgili firmalara aittir.
				Bu sitedeki bağlantılardan satın alım yapmanız durumunda komisyon kazanabiliriz.
			</Text>
		</View>
	);
}
