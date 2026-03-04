import { Stack } from "expo-router";

export const unstable_settings = {
	initialRouteName: "kategoriler"
};

export default function CategoriesLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				gestureEnabled: true,
				fullScreenGestureEnabled: true
			}}
		/>
	);
}
