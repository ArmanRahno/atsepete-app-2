import React from "react";
import { View, Text } from "react-native";
import ReviewStars from "./carousels/ReviewStars";

interface Props {
	review: NonNullable<Item["reviews"]>[number];
}

export default function ReviewCard({ review }: Props) {
	return (
		<View className="p-2 gap-1.5">
			<View className="flex flex-row items-center">
				<ReviewStars
					value={review.rating}
					size={10}
				/>

				<View className="w-[1px] h-3/4 mx-1 bg-border" />

				<Text className="text-xs text-muted-foreground">
					{new Date(review.date).toLocaleDateString("tr-TR", {
						year: "numeric",
						month: "short",
						day: "numeric"
					})}
				</Text>
			</View>

			<Text className="text-sm">{review.content}</Text>
		</View>
	);
}
