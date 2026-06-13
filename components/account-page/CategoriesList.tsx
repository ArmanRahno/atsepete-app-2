import React from "react";
import { FlatList, Text, View } from "react-native";
import Categories from "@/constants/Categories";
import findCategoryLabel from "@/lib/findCategoryLabel";
import { router } from "expo-router";
import { IconSymbol } from "../ui/IconSymbol";
import CategoryListener from "../CategoryListener";
import { useThemePalette } from "@/hooks/useThemePalette";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { ChevronRight } from "lucide-react-native";
import CategoryIconAura from "../CategoryIconAura";

type CategoriesListProps = {
	categories: string[];
	onRemoveCategory: (category: string) => void;
};

export default function CategoriesList({ categories, onRemoveCategory }: CategoriesListProps) {
	const { colors, isDark } = useThemePalette();
	const cardBackgroundColor = isDark ? "#1E1914" : "#FFFDF7";

	return (
		<FlatList
			data={categories}
			keyExtractor={cat => cat}
			renderItem={({ item }) => {
				const categoryIconName = Categories.find(c => c.value === item)?.icon;
				const label = findCategoryLabel(item);

				return (
					<View
						key={item}
						className="h-[72px] flex-row items-center overflow-hidden border border-border rounded-lg px-6 py-3"
						style={{
							backgroundColor: cardBackgroundColor,
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: isDark ? 0.22 : 0.06,
							shadowRadius: 4,
							elevation: 1
						}}
					>
						<AppTouchableOpacity
							onPress={() => router.push(`/kategoriler/${item}`)}
							className="h-full flex-1 flex-row gap-3 items-center pr-3"
						>
							<View className="relative h-10 w-10 items-center justify-center">
								<CategoryIconAura
									category={item}
									isDark={isDark}
								/>
								<IconSymbol
									// @ts-expect-error Expect error instead of type assertion
									name={categoryIconName}
									size={28}
									color={colors.mutedForeground}
								/>
							</View>

							<Text
								className="flex-1 text-base font-semibold text-foreground"
								numberOfLines={2}
								adjustsFontSizeToFit
								minimumFontScale={0.88}
							>
								{label}
							</Text>

							<View
								className="h-8 w-8 items-center justify-center rounded-full"
								style={{ backgroundColor: isDark ? "#2A241E" : "#F1E8DD" }}
							>
								<ChevronRight
									size={17}
									color={colors.mutedForeground}
									strokeWidth={2.4}
								/>
							</View>
						</AppTouchableOpacity>

						<CategoryListener
							className="ml-2 w-12 h-10 rounded-[0.65rem] px-0 py-0"
							category={item}
							onListenerSuccess={finalState => {
								if (!finalState) onRemoveCategory(item);
							}}
							size={22}
							is_user_subscribed
						/>
					</View>
				);
			}}
			ListEmptyComponent={
				<Text className="text-destructive text-center mt-6 text-lg font-bold">
					Alarm eklediğiniz kategori bulunmamaktadır.
				</Text>
			}
			contentContainerStyle={{ padding: 12, gap: 8 }}
		/>
	);
}
