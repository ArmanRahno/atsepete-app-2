import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import Header from "@/components/header/Header";
import HeaderFirstRow from "@/components/header/HeaderFirstRow";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Categories from "@/constants/Categories";
import { Link } from "expo-router";
import { FlatList, Text } from "react-native";
import { useThemePalette } from "@/hooks/useThemePalette";

const CategoriesScreen = () => {
	const { colors } = useThemePalette();

	return (
		<>
			<Header>
				<HeaderFirstRow />
				<HeaderSecondRow />
			</Header>
			<FlatList
				data={Categories}
				keyExtractor={item => item.value}
				renderItem={({ item }) => (
					<Link
						key={item.value}
						href={`/kategoriler/${item.value}`}
						asChild
					>
						<AppTouchableOpacity className="flex-row gap-6 items-center w-full px-6 py-3 self-start bg-card border border-border rounded-lg">
							<IconSymbol
								// @ts-expect-error Expect error instead of type assertion
								name={item.icon}
								size={32}
								color={colors.mutedForeground}
							/>
							<Text className="text-xl font-medium text-foreground">
								{item.label}
							</Text>
						</AppTouchableOpacity>
					</Link>
				)}
				contentContainerStyle={{ padding: 8, gap: 8 }}
			/>
		</>
	);
};

export default CategoriesScreen;
