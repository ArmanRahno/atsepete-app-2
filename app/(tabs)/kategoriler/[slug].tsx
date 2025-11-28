import CategoryListener from "@/components/CategoryListener";
import Header from "@/components/header/Header";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import HeaderText from "@/components/header/HeaderText";
import ItemCard from "@/components/item/item-card/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import findCategoryLabel from "@/lib/findCategoryLabel";
import { useFocusEffect } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useState, useCallback, memo } from "react";
import { FlatList, RefreshControl, ActivityIndicator, View, Text } from "react-native";

const API_URL =
	"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/page/with-params";

type CategoryData = {
	is_user_subscribed: boolean;
	items: Item[];
	totalItems: number;
	message?: undefined;
};

const MemoizedItemCard = memo(ItemCard);

const MarketplaceScreen = () => {
	const params = useSearchParams();
	const category = params.get("slug");
	const categoryLabel = findCategoryLabel(category!);
	const [items, setItems] = useState<Item[]>([]);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [userIsSubscribed, setUserIsSubscribed] = useState<boolean>(false);

	const fetchItems = useCallback(
		async (pageNum: number, append = false) => {
			try {
				if (pageNum === 0 && !refreshing) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}

				const response = await fetch(
					`${API_URL}?${new URLSearchParams({
						category: category!,
						p: pageNum.toString()
					})}`
				);

				if (!response.ok) {
					throw new Error("Error fetching items");
				}

				const data: CategoryData = await response.json();
				setTotalItems(data.totalItems);
				setUserIsSubscribed(data.is_user_subscribed);

				if (append) {
					setItems(prevItems => [...prevItems, ...data.items.slice(0, 18)]);
				} else {
					setItems(data.items.slice(0, 18));
				}
			} catch (error) {
				console.error("Error fetching homepage items:", error);
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

	if (!category)
		return (
			<Text className="p-4 text-lg font-medium text-destructive">Kategori bulunamadı!</Text>
		);
	if (loading && items.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow />
			</Header>

			<FlatList
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
				ListHeaderComponent={
					<View className="mt-1 mb-3">
						<View className="flex-row justify-center items-center gap-3">
							<HeaderText>{categoryLabel}</HeaderText>
							<CategoryListener
								category={category}
								is_user_subscribed={userIsSubscribed}
							/>
						</View>

						{items && items.length === 0 && (
							<Text className="mt-4 text-center text-destructive font-semibold">
								{categoryLabel} kategorisinde indirimli ürün bulunamadı.
							</Text>
						)}
					</View>
				}
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

export default MarketplaceScreen;
