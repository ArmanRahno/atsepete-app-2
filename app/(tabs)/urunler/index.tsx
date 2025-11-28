import FilterAndSortDialog, { Filters, SORT_OPTIONS } from "@/components/FilterAndSortDialog";
import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useFocusEffect } from "expo-router";
import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import formatPrice from "@/lib/formatPrice";
import {
	FlatList,
	RefreshControl,
	ActivityIndicator,
	View,
	NativeSyntheticEvent,
	NativeScrollEvent,
	TouchableOpacity
} from "react-native";
import FilterAndSortAppliedFilter from "@/components/FilterAndSortAppliedFilter";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { Text } from "react-native";
import { ChevronUp } from "lucide-react-native";
import UrunlerItemCard from "@/components/item/item-card/UrunlerItemCard";

const API_URL =
	"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/page/all-items";

type UrunlerPageData = {
	items: Item[];
	totalItems: number;
};

const defaultFilters = {
	sort: "en-yeni"
};

const MemoizedItemCard = memo(UrunlerItemCard);

export default function UrunlerScreen() {
	const [items, setItems] = useState<Item[]>([]);
	const [totalItems, setTotalItems] = useState<number>(0);

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);

	const [filters, setFilters] = useState<Filters>(defaultFilters);

	const [displayDialog, setDisplayDialog] = useState<boolean>(false);

	const [displayBackToTopBtn, setDisplayBackToTopBtn] = useState<boolean>(false);
	const flatListRef = useRef<FlatList<Item>>(null);

	const fetchItems = useCallback(
		async (pageNum: number, append = false, localFilters: Filters, isRefresh = false) => {
			try {
				if (append) {
					setLoadingMore(true);
				} else if (isRefresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}

				const params = new URLSearchParams();
				if (pageNum > 0) params.set("p", String(pageNum + 1));

				if (localFilters.sort) {
					params.set("siralama", localFilters.sort);
				}
				if (localFilters.minPrice) {
					params.set("min-fiyat", localFilters.minPrice);
				}
				if (localFilters.maxPrice) {
					params.set("max-fiyat", localFilters.maxPrice);
				}

				const response = await fetch(`${API_URL}?${params.toString()}`);

				if (!response.ok) {
					throw new Error("Error fetching items");
				}

				const data: UrunlerPageData = await response.json();
				setTotalItems(data.totalItems);

				if (append) {
					setItems(prevItems => [...prevItems, ...data.items.slice(0, 18)]);
				} else {
					setItems(data.items.slice(0, 18));
				}
			} catch (error) {
				console.error("Error fetching urunler items:", error);
			} finally {
				setLoading(false);
				setLoadingMore(false);
				setRefreshing(false);
			}
		},
		[]
	);

	useFocusEffect(
		useCallback(() => {
			setDisplayBackToTopBtn(false);

			const asyncCallback = async () => {
				setPage(0);
				await fetchItems(0, false, filters);
			};

			asyncCallback();
		}, [fetchItems, filters])
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setPage(0);
		fetchItems(0, false, filters, true);
	}, [fetchItems, filters]);

	const handleLoadMore = useCallback(() => {
		if (!loadingMore && items.length < totalItems) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchItems(nextPage, true, filters);
		}
	}, [items.length, totalItems, page, loadingMore, fetchItems, filters]);

	const handleApply = useCallback(
		(params: { minPrice?: string; maxPrice?: string; sort?: string }) => {
			setFilters(params);
			setPage(0);
			fetchItems(0, false, params);
		},
		[fetchItems]
	);

	const handleClearFilters = useCallback(() => {
		setFilters(defaultFilters);
		setPage(0);
		fetchItems(0, false, defaultFilters);
		setDisplayDialog(false);
	}, []);

	const handleScroll = useCallback((val: NativeSyntheticEvent<NativeScrollEvent>) => {
		const isThresholdMet = val.nativeEvent.contentOffset.y > 800;
		setDisplayBackToTopBtn(isThresholdMet);
	}, []);

	const handleScrollToTop = useCallback(() => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
	}, []);

	return (
		<>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow
					setDisplayDialog={setDisplayDialog}
					displaySortTouchable
				/>
			</Header>

			<FilterAndSortDialog
				visible={displayDialog}
				onClose={() => setDisplayDialog(false)}
				onApply={handleApply}
				onClearFilters={handleClearFilters}
				filters={filters}
			/>

			{loading && <LoadingIndicator />}

			{!loading && (
				<FlatList
					ref={flatListRef}
					data={items}
					onScroll={handleScroll}
					scrollEventThrottle={32}
					ListHeaderComponent={
						<>
							<HeaderText className="mt-2 mb-4">
								Tüm Pazaryerlerinde Bulunan Tüm Ürünler
							</HeaderText>
							{(filters.sort !== "en-yeni" ||
								filters.minPrice ||
								filters.maxPrice) && (
								<View className="flex-row gap-2 mb-4">
									<View className="flex-1 flex-row flex-wrap gap-x-1 gap-y-0.5 pr-2">
										{filters.sort !== "en-yeni" && (
											<FilterAndSortAppliedFilter
												onPress={() =>
													setFilters(val => {
														return { ...val, sort: "en-yeni" };
													})
												}
											>
												{SORT_OPTIONS.find(
													opt => opt.value === filters.sort
												)?.label || filters.sort}
											</FilterAndSortAppliedFilter>
										)}
										{filters.minPrice && (
											<>
												<FilterAndSortAppliedFilter
													onPress={() =>
														setFilters(val => {
															return { ...val, minPrice: "" };
														})
													}
												>
													Min. Fiyat: ₺{formatPrice(+filters.minPrice)}
												</FilterAndSortAppliedFilter>
											</>
										)}
										{filters.maxPrice && (
											<FilterAndSortAppliedFilter
												onPress={() =>
													setFilters(val => {
														return { ...val, maxPrice: "" };
													})
												}
											>
												Max. Fiyat: ₺{formatPrice(+filters.maxPrice)}{" "}
											</FilterAndSortAppliedFilter>
										)}
									</View>
								</View>
							)}
						</>
					}
					keyExtractor={item => item._id.toString()}
					renderItem={({ item, index }) => (
						<MemoizedItemCard
							className={
								index === 0
									? "rounded-t-lg"
									: index === items.length - 1
									? "rounded-b-lg"
									: ""
							}
							key={item._id.toString()}
							item={item}
						/>
					)}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={1.5}
					ListFooterComponent={
						loadingMore ? (
							<View style={{ padding: 16 }}>
								<ActivityIndicator />
							</View>
						) : null
					}
					className="p-2"
				/>
			)}
			{displayBackToTopBtn && (
				<TouchableOpacity
					className="absolute bottom-4 right-4 bg-background p-2 border border-border rounded-lg"
					onPress={handleScrollToTop}
				>
					<Text>
						<ChevronUp />
					</Text>
				</TouchableOpacity>
			)}
		</>
	);
}
