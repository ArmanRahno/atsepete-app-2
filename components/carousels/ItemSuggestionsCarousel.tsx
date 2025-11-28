import React, { useRef, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import ItemSuggestionCard from "./ItemSuggestionCard";
import { lightPrimary, lightSecondary } from "@/constants/Colors";
import { CustomConfig } from "react-native-reanimated-carousel/lib/typescript/types";

export default function ItemSuggestionsCarousel({
	suggestions
}: {
	suggestions: Item["suggestions"];
}) {
	const ref = useRef<ICarouselInstance>(null);
	const progress = useSharedValue<number>(0);
	const [carouselHeight, setCarouselHeight] = useState<number>(0);

	const itemWidth = 170;

	if (!suggestions || suggestions.length === 0) {
		return null;
	}

	const onPressPagination = (index: number) => {
		ref.current?.scrollTo({
			count: index - progress.value,
			animated: true
		});
	};

	return (
		<View className="mt-3">
			<View className="mb-2">
				<Text className="text-xl font-bold">Benzer Ürünler</Text>
			</View>

			<Carousel
				ref={ref}
				data={suggestions}
				onProgressChange={progress}
				loop={true}
				width={itemWidth}
				height={carouselHeight || undefined}
				snapEnabled={false}
				pagingEnabled={true}
				style={{
					width: "100%",
					minWidth: "100%"
				}}
				containerStyle={{ width: "100%" }}
				renderItem={({ item }) => (
					<View
						onLayout={event => {
							const { height } = event.nativeEvent.layout;
							setCarouselHeight(prevHeight => Math.max(prevHeight, height));
						}}
					>
						<ItemSuggestionCard item={item} />
					</View>
				)}
			/>

			{/* <Pagination.Basic
				progress={progress}
				data={suggestions}
				onPress={onPressPagination}
				containerStyle={{ gap: 8 }}
				dotStyle={{ backgroundColor: lightSecondary, borderRadius: 8 }}
				activeDotStyle={{ backgroundColor: lightPrimary }}
			/> */}
		</View>
	);
}
