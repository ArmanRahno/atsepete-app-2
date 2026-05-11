import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import {
	Activity,
	BarChart3,
	CircleDot,
	Percent,
	TrendingDown,
	TrendingUp
} from "lucide-react-native";
import formatPrice from "@/lib/formatPrice";
import { PriceChart } from "./PriceChart";
import ItemSuggestionsCarousel from "../carousels/ItemSuggestionsCarousel";
import ItemReviewsCarousel from "../carousels/ItemReviewsCarousel";
import ItemPriceCard from "./ItemPriceCard";
import { useThemePalette } from "@/hooks/useThemePalette";
import { semanticGreen, semanticRed } from "@/constants/SemanticColors";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type DetailedItemCardProps = {
	item: Item;
};

const styles = StyleSheet.create({
	title: {
		fontFamily: "Roboto_700Bold"
	},
	sectionTitle: {
		fontFamily: "Roboto_700Bold"
	},
	statLabel: {
		fontFamily: "Roboto_500Medium"
	},
	statValue: {
		fontFamily: "Roboto_700Bold"
	},
	statSubtle: {
		fontFamily: "Roboto_400Regular"
	},
	body: {
		fontFamily: "Roboto_400Regular"
	},
	chip: {
		fontFamily: "Roboto_500Medium"
	}
});

const formatDateObj = (value: Date | string | null | undefined) => {
	if (!value) return { formattedDate: "", formattedTime: "" };

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return { formattedDate: "", formattedTime: "" };
	}

	try {
		const formattedDate = new Intl.DateTimeFormat("tr-TR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			timeZone: "Europe/Istanbul"
		}).format(date);

		const formattedTime = new Intl.DateTimeFormat("tr-TR", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			timeZone: "Europe/Istanbul"
		}).format(date);

		return { formattedDate, formattedTime };
	} catch {
		return {
			formattedDate: date.toLocaleDateString("tr-TR"),
			formattedTime: date.toLocaleTimeString("tr-TR", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			})
		};
	}
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <View className={`rounded-[24px] bg-card p-4 ${className}`}>{children}</View>;
}

function StatCard({
	label,
	value,
	subtle,
	icon
}: {
	label: string;
	value: string | number;
	subtle?: string;
	icon?: React.ReactNode;
}) {
	return (
		<View
			className="rounded-2xl border border-border bg-card px-3 py-3"
			style={{ width: "48.5%", minHeight: 96 }}
		>
			<View className="min-h-[64px] flex-1 justify-between">
				<Text
					className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
					style={styles.statLabel}
				>
					{label}
				</Text>

				<View className="flex-1 flex-row items-center gap-1.5 py-1">
					{icon}
					<Text
						className="flex-1 text-sm text-foreground"
						numberOfLines={1}
						style={styles.statValue}
					>
						{value}
					</Text>
				</View>

				<Text
					className="text-[11px] text-muted-foreground"
					numberOfLines={1}
					style={styles.statSubtle}
				>
					{subtle || " "}
				</Text>
			</View>
		</View>
	);
}

export default function DetailedItemCard({ item }: DetailedItemCardProps) {
	const { colors, isDark } = useThemePalette();
	const red = semanticRed(isDark);
	const green = semanticGreen(isDark);
	const markdownStyles = useMemo(
		() =>
			StyleSheet.create({
				body: {
					color: colors.text,
					fontFamily: "Roboto_400Regular"
				},
				text: {
					color: colors.text
				},
				paragraph: {
					color: colors.text
				},
				heading1: {
					color: colors.text
				},
				heading2: {
					color: colors.text
				},
				heading3: {
					color: colors.text
				},
				strong: {
					color: colors.text
				},
				bullet_list: {
					color: colors.text
				},
				ordered_list: {
					color: colors.text
				},
				link: {
					color: colors.primary
				}
			}),
		[colors.primary, colors.text]
	);
	const {
		sortedPriceHistory,
		latestHistory,
		recent30History,
		recent30LowestPoint,
		recent30HighestPoint,
		recent30IncreaseCount,
		recent30DecreaseCount,
		recent30MoveCount
	} = useMemo(() => {
		const sortedPriceHistory = [...item.price_history]
			.filter(pricePoint => {
				if (!pricePoint || !pricePoint.date_time) return false;
				const parsed = new Date(String(pricePoint.date_time));
				return !Number.isNaN(parsed.getTime());
			})
			.sort(
				(a, b) =>
					new Date(String(a.date_time)).getTime() -
					new Date(String(b.date_time)).getTime()
			);

		const latestHistory = [...sortedPriceHistory].reverse();

		const now = Date.now();
		const recent30History = sortedPriceHistory.filter(pricePoint => {
			const pointTime = new Date(String(pricePoint.date_time)).getTime();
			return now - pointTime <= THIRTY_DAYS_MS;
		});

		const recent30LowestPoint =
			recent30History.length > 0
				? recent30History.reduce((min, point) => (point.price < min.price ? point : min))
				: null;

		const recent30HighestPoint =
			recent30History.length > 0
				? recent30History.reduce((max, point) => (point.price > max.price ? point : max))
				: null;

		const recent30IncreaseCount = recent30History.filter(
			pricePoint => pricePoint.price_action === "increase"
		).length;

		const recent30DecreaseCount = recent30History.filter(
			pricePoint => pricePoint.price_action === "decrease"
		).length;

		return {
			sortedPriceHistory,
			latestHistory,
			recent30History,
			recent30LowestPoint,
			recent30HighestPoint,
			recent30IncreaseCount,
			recent30DecreaseCount,
			recent30MoveCount: recent30IncreaseCount + recent30DecreaseCount
		};
	}, [item.price_history]);

	return (
		<View>
			<Section className="mb-4">
				<Text
					className="text-[26px] leading-[32px] tracking-tight text-foreground"
					style={styles.title}
				>
					{item.name}
				</Text>
			</Section>

			<ItemPriceCard item={item} />

			{recent30History.length > 0 && (
				<View className="mt-5">
					<View className="flex-row flex-wrap gap-2">
						<StatCard
							label="30 Gün Düşük"
							value={
								recent30LowestPoint
									? `₺${formatPrice(recent30LowestPoint.price)}`
									: "-"
							}
							subtle={
								recent30LowestPoint
									? formatDateObj(recent30LowestPoint.date_time).formattedDate
									: ""
							}
							icon={
								<TrendingDown
									size={15}
									color="#10b981"
								/>
							}
						/>

						<StatCard
							label="30 Gün Yüksek"
							value={
								recent30HighestPoint
									? `₺${formatPrice(recent30HighestPoint.price)}`
									: "-"
							}
							subtle={
								recent30HighestPoint
									? formatDateObj(recent30HighestPoint.date_time).formattedDate
									: ""
							}
							icon={
								<TrendingUp
									size={15}
									color="#ef4444"
								/>
							}
						/>

						<StatCard
							label="30 Gün Hareket"
							value={recent30MoveCount}
							subtle="Son 30 gün"
							icon={
								<BarChart3
									size={15}
									color={colors.mutedForeground}
								/>
							}
						/>

						<StatCard
							label="İndirim"
							value={
								typeof item.last_price_action_percent_magnitude === "number" &&
								item.last_price_action_percent_magnitude > 0
									? `-%${Math.round(item.last_price_action_percent_magnitude)}`
									: "---"
							}
							subtle="Son hareket"
							icon={
								<Percent
									size={15}
									color={colors.primary}
								/>
							}
						/>
					</View>
				</View>
			)}

			<Section className="mt-5">
				<Text
					className="mb-4 text-lg text-foreground"
					style={styles.sectionTitle}
				>
					Zamana göre fiyat değişimi
				</Text>

				<PriceChart data={sortedPriceHistory} />
			</Section>

			<Section className="mt-5">
				<View className="mb-4 flex-row items-center justify-between gap-3">
					<Text
						className="text-lg text-foreground"
						style={styles.sectionTitle}
					>
						Son hareketler
					</Text>

					<View className="flex-row items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-2.5 py-1">
						<Activity
							size={14}
							color={colors.mutedForeground}
						/>
						<Text
							className="text-xs text-muted-foreground"
							style={styles.chip}
						>
							{latestHistory.length} değişim
						</Text>
					</View>
				</View>

				<ScrollView
					nestedScrollEnabled
					showsVerticalScrollIndicator={false}
					style={{ maxHeight: 280 }}
					contentContainerStyle={{ gap: 8 }}
				>
					{latestHistory.map((pricePoint, index) => {
						if (!pricePoint || !pricePoint.date_time) return null;

						const formattedDate = formatDateObj(pricePoint.date_time).formattedDate;
						const isUp = pricePoint.price_action === "increase";
						const isDown = pricePoint.price_action === "decrease";
						const hasMagnitude =
							typeof pricePoint.price_action_percent_magnitude === "number" &&
							pricePoint.price_action_percent_magnitude > 0;

						return (
							<View
								key={`${pricePoint.date_time.toString()}-${index}`}
								className="rounded-xl bg-card border border-border px-3 py-3"
							>
								<View className="flex-row items-start justify-between gap-3">
									<Text
										className="text-xs text-muted-foreground"
										style={styles.body}
									>
										{formattedDate}
									</Text>

									{isUp ? (
										<View
											className="flex-row items-center gap-1.5 border border-red-700/25 bg-red-700/10 px-2 py-1 dark:border-red-500/20 dark:bg-red-500/20"
											style={{ borderRadius: 8 }}
										>
											<TrendingUp
												size={12}
												color={red}
											/>
											<Text
												className="text-[11px]"
												style={[styles.chip, { color: red }]}
											>
												{hasMagnitude
													? `%${Math.round(
															pricePoint.price_action_percent_magnitude
														)}`
													: "Yükseldi"}
											</Text>
										</View>
									) : isDown ? (
										<View
											className="flex-row items-center gap-1.5 border border-emerald-700/30 bg-emerald-700/20 px-2 py-1 dark:border-emerald-500/20 dark:bg-emerald-500/20"
											style={{ borderRadius: 8 }}
										>
											<TrendingDown
												size={12}
												color={green}
											/>
											<Text
												className="text-[11px]"
												style={[styles.chip, { color: green }]}
											>
												{hasMagnitude
													? `%${Math.round(
															pricePoint.price_action_percent_magnitude
														)}`
													: "Düştü"}
											</Text>
										</View>
									) : (
										<View
											className="flex-row items-center gap-1.5 bg-secondary px-2 py-1"
											style={{ borderRadius: 8 }}
										>
											<CircleDot
												size={12}
												color={colors.mutedForeground}
											/>
											<Text
												className="text-[11px] text-muted-foreground"
												style={styles.chip}
											>
												İlk fiyat
											</Text>
										</View>
									)}
								</View>

								<Text
									className="mt-2 text-base text-foreground"
									style={styles.statValue}
								>
									₺{formatPrice(pricePoint.price)}
								</Text>
							</View>
						);
					})}
				</ScrollView>
			</Section>

			{!!item.product_description && item.product_description.length > 0 && (
				<Section className="mt-6">
					<Text
						className="mb-3 text-lg text-foreground"
						style={styles.sectionTitle}
					>
						Ürün Açıklaması
					</Text>

					<Markdown style={markdownStyles}>{item.product_description}</Markdown>
				</Section>
			)}

			{!!item.suggestions?.length && (
				<Section className="mt-6">
					<ItemSuggestionsCarousel suggestions={item.suggestions} />
				</Section>
			)}

			{!!item.reviews?.length && (
				<Section className="mt-6">
					<ItemReviewsCarousel
						slug={item.url_slug}
						rating={item.rating}
						reviews={item.reviews}
						type="INDIRIMLER"
					/>
				</Section>
			)}

			{item.ai_review && (
				<Section className="mt-6">
					<Text
						className="mb-2 text-base text-foreground"
						style={styles.sectionTitle}
					>
						Yapay Zeka Değerlendirmeler Özeti
					</Text>

					<Text
						className="text-foreground"
						style={styles.body}
					>
						{item.ai_review}
					</Text>
				</Section>
			)}
		</View>
	);
}
