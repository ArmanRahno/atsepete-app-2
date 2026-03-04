import { Stack } from "expo-router";

export const unstable_settings = {
	initialRouteName: "pazaryerleri"
};

export default function MarketplacesLayout() {
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
