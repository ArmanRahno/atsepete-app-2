import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import ItemReviewCard from "./ItemReviewCard";
import { Card } from "../shad-cn/card";
import { ChevronRight, ChevronRightCircle } from "lucide-react-native";
import { lightForeground, lightPrimary } from "@/constants/Colors";
import RatingStars from "./RatingStars";
import { router } from "expo-router";
import AppTouchableOpacity from "../AppTouchableOpacity";

type LocalReview = NonNullable<Item["reviews"]>[number];

type CarouselReview = LocalReview | { isLink: true };

interface ItemReviewsCarouselProps {
	slug: Item["url_slug"];
	rating: Item["rating"];
	reviews: CarouselReview[] | null | undefined;
	type: "INDIRIMLER" | "URUNLER";
}

export default function ItemReviewsCarousel({
	slug,
	rating,
	reviews,
	type
}: ItemReviewsCarouselProps) {
	const ref = useRef<ICarouselInstance>(null);
	const progress = useSharedValue<number>(0);
	const [carouselHeight, setCarouselHeight] = useState<number>(0);

	const itemWidth = 170;

	if (!reviews || reviews.length === 0) {
		return null;
	}

	const formattedReviews = [...reviews].concat({ isLink: true });

	return (
		<View className="mt-3 gap-2">
			<View className="mb-2 gap-2">
				<Text className="text-xl font-bold">Ürün Yorumları</Text>
				<View className="flex-row items-center gap-4">
					<RatingStars value={rating} />

					<AppTouchableOpacity
						onPress={() =>
							router.push(
								`/${
									type === "INDIRIMLER" ? "indirimler" : "urunler"
								}/${slug}/reviews`
							)
						}
						className="flex-row gap-0.5 items-center"
					>
						<Text className="text-lg text-primary font-medium">Tümü</Text>
						<ChevronRight
							color={lightPrimary}
							size={20}
							strokeWidth={2.3}
						/>
					</AppTouchableOpacity>
				</View>
			</View>

			<View style={{ height: 120 }}>
				<Carousel
					key={carouselHeight}
					ref={ref}
					data={formattedReviews}
					onProgressChange={progress}
					loop={false}
					width={itemWidth}
					height={120}
					snapEnabled={false}
					pagingEnabled={true}
					style={{
						width: "100%",
						minWidth: "100%"
					}}
					containerStyle={{ width: "100%" }}
					renderItem={({ item }) => {
						if ((item as { isLink: boolean }).isLink) {
							return (
								<Pressable
									className="flex-1"
									onPress={() =>
										router.push(
											`/${
												type === "INDIRIMLER" ? "indirimler" : "urunler"
											}/${slug}/reviews`
										)
									}
								>
									<View
										key="LINK"
										className="flex-1"
										onLayout={event => {
											const { height } = event.nativeEvent.layout;
											setCarouselHeight(prevHeight =>
												Math.max(prevHeight, height)
											);
										}}
									>
										<Card className="flex-1 w-[160px] min-w-[160px] max-w-[160px] gap-2 justify-center items-center p-3 m-1 overflow-hidden">
											<Text className="text-foreground font-semibold">
												Tüm Yorumlar
											</Text>
											<ChevronRightCircle
												color={lightForeground}
												size={20}
											/>
										</Card>
									</View>
								</Pressable>
							);
						}

						return (
							<View
								key={(item as NonNullable<Item["reviews"]>[number]).content}
								className="flex-1"
								onLayout={event => {
									const { height } = event.nativeEvent.layout;
									setCarouselHeight(prevHeight => Math.max(prevHeight, height));
								}}
							>
								<ItemReviewCard
									slug={slug}
									review={item as LocalReview}
								/>
							</View>
						);
					}}
				/>
			</View>
		</View>
	);
}
