import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import Header from "@/components/header/Header";
import HeaderFirstRow from "@/components/header/HeaderFirstRow";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { useFuseFilteredList } from "@/components/hooks/useFuseFilteredList";
import IslandSearchInput from "@/components/IslandSearchInput";
import ProgressiveBlur from "@/components/ProgressiveBlur";
import MarketplaceListener from "@/components/MarketplaceListener";
import Marketplaces from "@/constants/Marketplaces";
import { Link } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { useThemePalette } from "@/hooks/useThemePalette";
import { ChevronRight } from "lucide-react-native";
import { useAlarmSubscriptions } from "@/hooks/useAlarmSubscriptions";
import { LinearGradient } from "expo-linear-gradient";
import getMarketplaceCardHue from "@/lib/getMarketplaceCardHue";
import { foldForSearch } from "@/lib/search/foldForSearch";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type SearchMarketplaceItem = (typeof Marketplaces)[number] & {
	_label?: string;
	_value?: string;
};

const MarketplaceSearchOrder = [
	"trendyol",
	"hepsiburada",
	"amazon",
	"n11",
	"pttavm",
	"ciceksepeti",
	"mediamarkt",
	"idefix",
	"teknosa",
	"koctas",
	"pazarama",
	"dr",
	"turkcell",
	"avansas"
];

function orderItems(items: SearchMarketplaceItem[]): SearchMarketplaceItem[] {
	const byValue = new Map(items.map(item => [item.value, item]));
	const orderedItems = MarketplaceSearchOrder.flatMap(value => {
		const item = byValue.get(value);
		return item ? [item] : [];
	});
	const orderedValues = new Set(MarketplaceSearchOrder);

	return [...orderedItems, ...items.filter(item => !orderedValues.has(item.value))];
}

function normalizeItems(items: SearchMarketplaceItem[]): SearchMarketplaceItem[] {
	return items.map(item => ({
		...item,
		_label: item._label ?? foldForSearch(item.label),
		_value: item._value ?? foldForSearch(item.value)
	}));
}

const MarketplacesScreen = () => {
	const { colors, isDark } = useThemePalette();
	const { isMarketplaceSubscribed, setMarketplaceSubscribed } = useAlarmSubscriptions();
	const [query, setQuery] = useState("");
	const deferredQuery = useDeferredValue(query);
	const listRef = useRef<FlatList<SearchMarketplaceItem> | null>(null);
	const cardBackgroundColor = isDark ? "#1E1914" : "#FFFDF7";

	const items = useMemo(() => normalizeItems(orderItems(Marketplaces)), []);

	const fuseKeys: { name: "_label" | "_value"; weight: number }[] = useMemo(
		() => [
			{ name: "_label", weight: 0.95 },
			{ name: "_value", weight: 0.1 }
		],
		[]
	);

	const results = useFuseFilteredList({
		items,
		query: deferredQuery,
		keys: fuseKeys,
		threshold: 0.25,
		limit: 100
	});

	const filteredItems = deferredQuery ? results.map(result => result.item) : items;

	useEffect(() => {
		if (!deferredQuery) return;

		listRef.current?.scrollToOffset({
			offset: 0,
			animated: false
		});
	}, [deferredQuery]);

	return (
		<>
			<Header>
				<HeaderFirstRow />
				<HeaderSecondRow />
			</Header>

			<View className="flex-1">
				<FlatList
					ref={listRef}
					data={filteredItems}
					keyExtractor={item => item.value}
					renderItem={({ item }) => (
						<View
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
								colors={getMarketplaceCardHue(item.value, isDark)}
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
							<Link
								key={item.value}
								href={`/pazaryerleri/${item.value}`}
								asChild
							>
								<AppTouchableOpacity className="h-full flex-1 flex-row items-center justify-between pr-3">
									<View
										className="h-10 justify-center items-start"
										style={{
											minWidth: 124
										}}
									>
										<item.Icon
											style={{
												transformOrigin: "left center",
												transform: [{ scale: 1.24 }]
											}}
										/>
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
							</Link>

							<MarketplaceListener
								className="ml-2 w-12 h-10 rounded-[0.65rem] px-0 py-0"
								marketplace={item.value}
								size={22}
								is_user_subscribed={isMarketplaceSubscribed(item.value)}
								onListenerSuccess={finalState => {
									setMarketplaceSubscribed(item.value, finalState);
								}}
							/>
						</View>
					)}
					ListEmptyComponent={
						<View
							className="items-center rounded-lg border border-border px-4 py-6"
							style={{ backgroundColor: cardBackgroundColor }}
						>
							<Text className="text-sm text-muted-foreground">Pazaryeri bulunamadı.</Text>
						</View>
					}
					contentContainerStyle={{
						paddingTop: 88,
						paddingHorizontal: 12,
						paddingBottom: 12,
						gap: 8
					}}
					keyboardShouldPersistTaps="handled"
				/>
				<View
					pointerEvents="box-none"
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						zIndex: 20
					}}
				>
					<ProgressiveBlur
						isDark={isDark}
						height={104}
					/>
					<IslandSearchInput
						placeholder="Pazaryeri ara"
						value={query}
						onChangeText={setQuery}
					/>
				</View>
			</View>
		</>
	);
};

export default MarketplacesScreen;
