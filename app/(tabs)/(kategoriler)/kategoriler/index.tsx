import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import CategoryListener from "@/components/CategoryListener";
import Header from "@/components/header/Header";
import HeaderFirstRow from "@/components/header/HeaderFirstRow";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { useFuseFilteredList } from "@/components/hooks/useFuseFilteredList";
import type { FuseListResult } from "@/components/hooks/useFuseFilteredList";
import IslandSearchInput from "@/components/IslandSearchInput";
import ProgressiveBlur from "@/components/ProgressiveBlur";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CategoryIconAura, { getCategoryAuraColor } from "@/components/CategoryIconAura";
import Categories from "@/constants/Categories";
import CategoriesKeywords from "@/constants/CategoriesKeywords";
import { Link } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { useThemePalette } from "@/hooks/useThemePalette";
import { ChevronRight } from "lucide-react-native";
import { useAlarmSubscriptions } from "@/hooks/useAlarmSubscriptions";
import { foldForSearch } from "@/lib/search/foldForSearch";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type SearchCategoryItem = (typeof Categories)[number] & {
	keywords?: readonly string[];
	_label?: string;
	_value?: string;
	_keywords?: readonly string[];
};

type CategoryListItem = SearchCategoryItem & {
	matchedKeyword?: string;
};

const CategorySearchOrder = [
	"giyim",
	"ayakkabi",
	"aksesuar",
	"kozmetik",
	"kisisel-bakim",
	"gida",
	"elektronik",
	"telefon",
	"ev-ve-yasam",
	"mutfak",
	"kadin-giyim",
	"saglik-ve-bakim",
	"elektrikli-ev-aletleri",
	"mobilya",
	"ev-dekorasyon",
	"saat-gozluk",
	"anne-ve-bebek",
	"oto-ve-motosiklet",
	"oto-aksesuar",
	"arac-ici-aksesuarlar",
	"erkek-giyim",
	"petshop",
	"spor-ve-outdoor",
	"bisiklet",
	"teknoloji",
	"dijital-urunler",
	"kucuk-ev-aletleri",
	"temizlik-urunleri",
	"yapi-ve-dekorasyon",
	"akilli-ev-sistemleri",
	"saat",
	"anne-bebek-bakim",
	"bebek-beslenme",
	"motosiklet-aksesuar",
	"evcil-hayvan",
	"hediye",
	"oyuncak",
	"video-oyun",
	"kitap",
	"film-ve-dizi",
	"muzik",
	"ofis-ve-kirtasiye",
	"kirtasiye-urunleri",
	"organik-urunler",
	"temizlik-ve-koruma",
	"t-shirt",
	"takim-elbise",
	"kampanya"
];

function orderItems(items: SearchCategoryItem[]): SearchCategoryItem[] {
	const byValue = new Map(items.map(item => [item.value, item]));
	const orderedItems = CategorySearchOrder.flatMap(value => {
		const item = byValue.get(value);
		return item ? [item] : [];
	});
	const orderedValues = new Set(CategorySearchOrder);

	return [...orderedItems, ...items.filter(item => !orderedValues.has(item.value))];
}

function normalizeItems(items: SearchCategoryItem[]): SearchCategoryItem[] {
	return items.map(item => {
		const keywords = item.keywords ?? CategoriesKeywords[item.value] ?? [];

		return {
			...item,
			keywords,
			_label: item._label ?? foldForSearch(item.label),
			_value: item._value ?? foldForSearch(item.value),
			_keywords: item._keywords ?? keywords.map(keyword => foldForSearch(keyword))
		};
	});
}

function getMatchedKeyword(result: FuseListResult<SearchCategoryItem>) {
	const keywordMatch = result.matches?.find(match => match.key === "_keywords");
	if (!keywordMatch?.value) return undefined;

	return result.item.keywords?.find(keyword => foldForSearch(keyword) === keywordMatch.value);
}

function capitalizeSearchResult(value: string) {
	return value.replace(/(^|\s)(\S)/g, (_, prefix: string, character: string) => {
		return `${prefix}${character.toLocaleUpperCase("tr-TR")}`;
	});
}

const CategoriesScreen = () => {
	const { colors, isDark } = useThemePalette();
	const { isCategorySubscribed, setCategorySubscribed } = useAlarmSubscriptions();
	const [query, setQuery] = useState("");
	const deferredQuery = useDeferredValue(query);
	const listRef = useRef<FlatList<CategoryListItem> | null>(null);
	const cardBackgroundColor = isDark ? "#1E1914" : "#FFFDF7";
	const categoryIconOpacity = isDark ? 0.76 : 0.94;

	const items = useMemo(() => normalizeItems(orderItems(Categories)), []);

	const fuseKeys: { name: "_label" | "_value" | "_keywords"; weight: number }[] = useMemo(
		() => [
			{ name: "_label", weight: 0.95 },
			{ name: "_value", weight: 0.1 },
			{ name: "_keywords", weight: 0.35 }
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

	const filteredItems: CategoryListItem[] = deferredQuery
		? results.map(result => ({
				...result.item,
				matchedKeyword: getMatchedKeyword(result)
			}))
		: items;

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
							className="h-[72px] flex-row items-center overflow-hidden border border-border rounded-lg px-6 py-3"
							style={{
								backgroundColor: cardBackgroundColor,
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: isDark ? 0.22 : 0.06,
								shadowRadius: 4,
								elevation: 1
							}}
						>
							<Link
								key={item.value}
								href={`/kategoriler/${item.value}`}
								asChild
							>
								<AppTouchableOpacity className="h-full flex-1 flex-row gap-3 items-center pr-3">
									<View className="relative h-10 w-10 items-center justify-center">
										<CategoryIconAura
											category={item.value}
											isDark={isDark}
										/>
										<IconSymbol
											// @ts-expect-error Expect error instead of type assertion
											name={item.icon}
											size={28}
											color={getCategoryAuraColor(item.value)}
											style={{ opacity: categoryIconOpacity }}
										/>
									</View>
									<View className="flex-1 justify-center">
										<Text
											className="text-base font-semibold leading-5 text-foreground"
											numberOfLines={item.matchedKeyword ? 1 : 2}
										>
											{item.label}
										</Text>
										{item.matchedKeyword ? (
											<Text
												className="mt-0.5 text-xs leading-4 text-muted-foreground"
												numberOfLines={1}
											>
												{capitalizeSearchResult(item.matchedKeyword)}
											</Text>
										) : null}
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

							<CategoryListener
								className="ml-2 w-12 h-10 rounded-[0.65rem] px-0 py-0"
								category={item.value}
								size={22}
								is_user_subscribed={isCategorySubscribed(item.value)}
								onListenerSuccess={finalState => {
									setCategorySubscribed(item.value, finalState);
								}}
							/>
						</View>
					)}
					ListEmptyComponent={
						<View
							className="items-center rounded-lg border border-border px-4 py-6"
							style={{ backgroundColor: cardBackgroundColor }}
						>
							<Text className="text-sm text-muted-foreground">
								Kategori bulunamadı.
							</Text>
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
						placeholder="Kategori ara"
						value={query}
						onChangeText={setQuery}
					/>
				</View>
			</View>
		</>
	);
};

export default CategoriesScreen;
