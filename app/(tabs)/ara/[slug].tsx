import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import ItemCard from "@/components/item/item-card/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useFocusEffect } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useState, useCallback, memo } from "react";
import { FlatList, RefreshControl, ActivityIndicator, View, Text } from "react-native";

const API_URL =
	"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/page/search";

type SearchData = {
	items: Item[];
	totalItems: number;
};

const MemoizedItemCard = memo(ItemCard);

const SearchScreen = () => {
	const params = useSearchParams();
	const searchTerm = params.get("slug");
	const [items, setItems] = useState<Item[]>([]);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);

	const fetchItems = useCallback(
		async (pageNum: number, append = false) => {
			try {
				if (pageNum === 0 && !refreshing) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}

				const response = await fetch(API_URL, {
					method: "POST",
					body: JSON.stringify([searchTerm, pageNum])
				});

				if (!response.ok) {
					setTotalItems(0);
					throw new Error("Error fetching items");
				}

				const data: SearchData = await response.json();

				setTotalItems(data.totalItems);

				if (append) {
					setItems(prevItems => [...prevItems, ...data.items.slice(0, 18)]);
				} else {
					setItems(data.items.slice(0, 18));
				}
			} catch (error) {
				console.error("Error fetching search page items:", error);
			} finally {
				setLoading(false);
				setLoadingMore(false);
				setRefreshing(false);
			}
		},
		[refreshing]
	);

	useFocusEffect(
		useCallback(() => {
			setPage(0);
			fetchItems(0);
		}, [fetchItems])
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setPage(0);
		fetchItems(0);
	}, [fetchItems]);

	const handleLoadMore = useCallback(() => {
		if (!loadingMore && items.length < totalItems) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchItems(nextPage, true);
		}
	}, [items.length, totalItems, page, loadingMore, fetchItems]);

	if (loading && items.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<FlatList
				ListHeaderComponent={
					<>
						<View className="my-2">
							<HeaderText>{searchTerm}</HeaderText>
						</View>

						{!loading && totalItems === 0 && (
							<Text className="mt-4 text-center text-destructive font-semibold">
								Bu arama için sonuç bulunamadı.
							</Text>
						)}
					</>
				}
				data={items}
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
		</>
	);
};

export default SearchScreen;
