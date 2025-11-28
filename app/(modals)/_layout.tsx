import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalsLayout() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<Stack screenOptions={{ headerShown: false }} />
		</SafeAreaView>
	);
}
