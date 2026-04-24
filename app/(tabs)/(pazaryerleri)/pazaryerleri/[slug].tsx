import Header from "@/components/header/Header";
import HeaderFirstRow from "@/components/header/HeaderFirstRow";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import HeaderText from "@/components/header/HeaderText";
import ItemCard from "@/components/item/item-card/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import MarketplaceListener from "@/components/MarketplaceListener";
import findMarketplaceLabel from "@/lib/findMarketplaceLabel";
import { useFocusEffect } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useState, useCallback, memo, useRef } from "react";
import { FlatList, RefreshControl, ActivityIndicator, View, Text, StyleSheet } from "react-native";

const API_URL = "https://atsepete.net/api/application/page/with-params";
const PAGE_SIZE = 18;

type MarketplaceData = {
	is_user_subscribed: boolean;
	items: Item[];
	totalItems: number;
	message?: undefined;
};

const MemoizedItemCard = memo(ItemCard);

const MarketplaceScreen = () => {
	const params = useSearchParams();
	const marketplace = params.get("slug");
	const marketplaceLabel = findMarketplaceLabel(marketplace!);

	const [items, setItems] = useState<Item[]>([]);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [refreshing, setRefreshing] = useState<boolean>(false);

	const [page, setPage] = useState<number>(1);

	const loadMoreLockRef = useRef(false);

	const [userIsSubscribed, setUserIsSubscribed] = useState<boolean>(false);

	const dedupeById = useCallback((list: Item[]) => {
		const seen = new Set<string>();
		return list.filter(it => {
			const id = it?._id?.toString?.() ?? String(it?._id);
			if (!id) return true;
			if (seen.has(id)) return false;
			seen.add(id);
			return true;
		});
	}, []);

	const fetchItems = useCallback(
		async (pageNum: number, append = false) => {
			if (!marketplace) return;

			try {
				if (pageNum === 1 && !refreshing) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}

				const response = await fetch(
					`${API_URL}?${new URLSearchParams({
						marketplace: marketplace,
						p: pageNum.toString()
					})}`
				);

				if (!response.ok) throw new Error("Error fetching items");

				const data: MarketplaceData = await response.json();
				setTotalItems(data.totalItems);
				setUserIsSubscribed(data.is_user_subscribed);

				const nextChunk = (data.items ?? []).slice(0, PAGE_SIZE);

				if (append) {
					setItems(prev => dedupeById([...prev, ...nextChunk]));
				} else {
					setItems(dedupeById(nextChunk));
				}
			} catch (error) {
				console.error("Error fetching marketplace items:", error);
			} finally {
				setLoading(false);
				setLoadingMore(false);
				setRefreshing(false);
				loadMoreLockRef.current = false;
			}
		},
		[refreshing, marketplace, dedupeById]
	);

	useFocusEffect(
		useCallback(() => {
			setPage(1);
			fetchItems(1, false);
		}, [fetchItems])
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setPage(1);
		fetchItems(1, false);
	}, [fetchItems]);

	const handleLoadMore = useCallback(() => {
		if (loadMoreLockRef.current) return;
		if (loadingMore) return;
		if (items.length >= totalItems) return;

		loadMoreLockRef.current = true;

		const nextPage = page + 1;
		setPage(nextPage);
		fetchItems(nextPage, true);
	}, [items.length, totalItems, page, loadingMore, fetchItems]);

	if (!marketplace) {
		return (
			<Text className="p-4 text-lg font-medium text-destructive">Pazaryeri bulunamadı!</Text>
		);
	}

	if (loading && items.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Header>
				<HeaderFirstRow />
				<HeaderSecondRow />
			</Header>

			<FlatList
				data={items}
				keyExtractor={item => item._id.toString()}
				renderItem={({ item }) => {
					return <MemoizedItemCard item={item} />;
				}}
				ItemSeparatorComponent={() => <View className="h-2" />}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={1.5}
				ListHeaderComponent={
					<View className="flex-row flex-wrap justify-center items-center gap-3 py-3">
						<View className="flex-1 min-w-0">
							<HeaderText className="text-center flex-shrink">
								Bütün {marketplaceLabel} ürünlerine alarm kur
							</HeaderText>
						</View>

						<View style={{ flexShrink: 0 }}>
							<MarketplaceListener
								className="px-4 py-2"
								marketplace={marketplace}
								is_user_subscribed={userIsSubscribed}
							/>
						</View>
					</View>
				}
				ListFooterComponent={
					loadingMore ? (
						<View style={{ padding: 16 }}>
							<ActivityIndicator />
						</View>
					) : null
				}
				contentContainerStyle={styles.listContent}
			/>
		</>
	);
};

export default MarketplaceScreen;

const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: 8,
		paddingTop: 8,
		paddingBottom: 24
	}
});
