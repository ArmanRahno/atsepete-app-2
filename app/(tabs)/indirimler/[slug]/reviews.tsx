import React, { useState, useEffect, useCallback, memo } from "react";
import { View, Text, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSearchParams } from "expo-router/build/hooks";
import { Card } from "@/components/shad-cn/card";
import ReviewPagePriceCard from "@/components/ReviewScreenPriceCard";
import ReviewCard from "@/components/ReviewCard";
import LoadingIndicator from "@/components/LoadingIndicator";

const itemEndpoint = "https://atsepete.net/api/application/page/item";
const reviewsEndpoint = "https://atsepete.net/api/application/page/reviews";

const MemoizedReviewCard = memo(ReviewCard);

export default function UrunlerReviewsScreen() {
	const searchParams = useSearchParams();
	const slug = searchParams.get("slug");

	const [item, setItem] = useState<Item | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [reviews, setReviews] = useState<Item["reviews"]>([]);
	const [page, setPage] = useState<number>(1);
	const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(true);
	const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

	const [refreshing, setRefreshing] = useState<boolean>(false);

	const fetchItem = useCallback(
		async (reset?: boolean) => {
			if (!slug) {
				setError("No slug provided.");
				setLoading(false);
				return;
			}

			try {
				if (reset) {
					setLoading(true);
					setRefreshing(true);
				}

				const res = await fetch(`${itemEndpoint}/${slug}`);

				if (!res.ok) {
					throw new Error("Failed to fetch item data.");
				}

				const data = (await res.json()) as Item | null;

				if (!data || !data.reviews || data.reviews.length === 0) {
					setError("Ürün veya yorumlar bulunamadı.");
					setLoading(false);
					setRefreshing(false);
					return;
				}

				setItem(data);
				setReviews(data.reviews);
				setHasMoreReviews(true);
				setPage(1);
				setLoading(false);
				setRefreshing(false);
			} catch (err: any) {
				setError(err.message);
				setLoading(false);
				setRefreshing(false);
			}
		},
		[slug]
	);

	useEffect(() => {
		fetchItem();
	}, [fetchItem]);

	const fetchMoreReviews = useCallback(async () => {
		if (!slug || isFetchingMore || !hasMoreReviews) return;

		setIsFetchingMore(true);
		try {
			const nextPage = page + 1;
			const res = await fetch(reviewsEndpoint, {
				method: "POST",
				body: JSON.stringify({ slug, batch: nextPage })
			});

			if (!res.ok) throw new Error("Failed to fetch more reviews.");

			const data = await res.json();

			if (!data || data.length === 0) {
				setHasMoreReviews(false);
			} else {
				setReviews(prev => {
					if (!prev) return prev;

					return [...prev, ...data];
				});
				setPage(nextPage);
			}
		} catch (err) {
			console.warn("Error fetching more reviews: ", err);
		} finally {
			setIsFetchingMore(false);
		}
	}, [slug, page, hasMoreReviews, isFetchingMore]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchItem(true);
	}, [fetchItem]);

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<LoadingIndicator />
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 justify-center items-center p-4">
				<Text className="text-lg font-semibold text-red-600 mb-2">{error}</Text>
				<TouchableOpacity onPress={() => fetchItem(true)}>
					<Text className="text-base font-medium text-blue-600 underline">
						Tekrar Dene
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!item) {
		return (
			<View className="flex-1 justify-center items-center p-4">
				<Text className="text-lg">Ürün bulunamadı.</Text>
			</View>
		);
	}

	return (
		<FlatList
			className="p-2 pb-6"
			contentContainerClassName="p-3 pb-6 bg-background"
			data={reviews}
			keyExtractor={(_, index) => `review-${index}`}
			renderItem={({ item: review }) => <MemoizedReviewCard review={review} />}
			ListHeaderComponent={
				<>
					<View className="mb-4">
						<ReviewPagePriceCard
							item={item}
							type="INDIRIMLER"
						/>

						{item.ai_review && (
							<Card className="rounded-2xl p-4 mt-4 bg-secondary">
								<Text className="font-medium mb-2">
									Yapay Zeka Değerlendirmeler Özeti:
								</Text>

								<Text className="text-sm">{item.ai_review}</Text>
							</Card>
						)}
					</View>

					<Text className="text-2xl font-medium mb-2">Ürün Değerlendirmeleri</Text>
				</>
			}
			ItemSeparatorComponent={() => <View className="my-2 h-[1px] bg-border" />}
			onEndReachedThreshold={0.3}
			onEndReached={fetchMoreReviews}
			ListFooterComponent={
				isFetchingMore ? (
					<ActivityIndicator
						className="my-2"
						size="small"
					/>
				) : null
			}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			}
		/>
	);
}
