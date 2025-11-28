import React from "react";
import { View, Text } from "react-native";
import { Card } from "../shad-cn/card";
import { Pressable } from "react-native";
import { router, Router } from "expo-router";
import ReviewStars from "./ReviewStars";

type ItemReviewCardProps = { slug: Item["url_slug"]; review: NonNullable<Item["reviews"]>[0] };

export default function ItemReviewCard(props: ItemReviewCardProps) {
	const { content, date, rating } = props.review;

	return (
		<Pressable
			className="flex-1"
			onPress={() => router.push(`/indirimler/${props.slug}/reviews`)}
		>
			<Card className="flex-1 w-[160px] min-w-[160px] max-w-[160px] p-3 m-1 overflow-hidden">
				<View className="gap-2">
					<View className="flex flex-row items-center">
						<ReviewStars
							value={rating}
							size={10}
						/>

						<View className="w-[1px] h-3/4 mx-1 bg-border" />

						<Text className="text-xs text-muted-foreground">
							{new Date(date).toLocaleDateString("tr-TR", {
								year: "numeric",
								month: "short",
								day: "numeric"
							})}
						</Text>
					</View>

					<Text
						className="text-sm"
						numberOfLines={4}
					>
						{content}
					</Text>
				</View>
			</Card>
		</Pressable>
	);
}
