import React from "react";
import { FlatList, Pressable, Text, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import { lightMutedForeground } from "@/constants/Colors";
import Categories from "@/constants/Categories";
import findCategoryLabel from "@/lib/findCategoryLabel";
import { router } from "expo-router";
import { IconSymbol } from "../ui/IconSymbol";
import { Card } from "../shad-cn/card";
import CategoryListener from "../CategoryListener";

type CategoriesListProps = {
	categories: string[];
	onRemoveCategory: (category: string) => void;
};

export default function CategoriesList({ categories, onRemoveCategory }: CategoriesListProps) {
	return (
		<FlatList
			data={categories}
			keyExtractor={cat => cat}
			renderItem={({ item }) => {
				const categoryIconName = Categories.find(c => c.value === item)?.icon;
				const label = findCategoryLabel(item);

				return (
					<Card
						key={item}
						className="px-6 py-3 flex-row gap-3 justify-between items-center"
					>
						<Pressable
							onPress={() => router.push(`/(tabs)/kategoriler/${item}`)}
							className="flex-row items-center gap-4"
						>
							<IconSymbol
								// @ts-expect-error Expect error instead of type assertion
								name={categoryIconName}
								size={40}
								color={lightMutedForeground}
							/>

							<Text className="pr-2 text-primary text-lg font-bold">{label}</Text>
						</Pressable>

						<CategoryListener
							className="rounded-[0.65rem] px-4 py-2"
							category={item}
							onListenerSuccess={() => onRemoveCategory(item)}
							size={24}
							is_user_subscribed
						/>
					</Card>
				);
			}}
			ListEmptyComponent={
				<Text className="text-destructive text-center mt-6 text-lg font-bold">
					Alarm eklediğiniz kategori bulunmamaktadır.
				</Text>
			}
			contentContainerClassName="p-2 gap-2"
		/>
	);
}
