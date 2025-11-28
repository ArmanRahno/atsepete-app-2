import Header from "@/components/header/Header";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import HeaderText from "@/components/header/HeaderText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Categories from "@/constants/Categories";
import { lightMutedForeground, lightPrimary, lightSecondary } from "@/constants/Colors";
import { Link } from "expo-router";
import { FlatList, Text, TouchableOpacity } from "react-native";

const CategoriesScreen = () => {
	return (
		<>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow />
			</Header>
			<FlatList
				data={Categories}
				keyExtractor={item => item.value}
				renderItem={({ item }) => (
					<Link
						key={item.value}
						href={`/(tabs)/kategoriler/${item.value}`}
						asChild
					>
						<TouchableOpacity className="flex-row gap-6 items-center w-full px-6 py-3 self-start bg-background border border-border rounded-lg">
							<IconSymbol
								// @ts-expect-error Expect error instead of type assertion
								name={item.icon}
								size={32}
								color={lightMutedForeground}
							/>
							<Text className="text-xl font-medium text-foreground">
								{item.label}
							</Text>
						</TouchableOpacity>
					</Link>
				)}
				contentContainerStyle={{ padding: 8, gap: 8 }}
			/>
		</>
	);
};

export default CategoriesScreen;
