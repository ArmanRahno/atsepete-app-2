import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Device from "expo-device";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.HIGH,
			vibrationPattern: [0, 250, 250],
			lightColor: "#FF231F7C"
		});
	}

	if (!Device.isDevice) {
		console.log("Push notifications only work on physical devices");
		return null;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}
	if (finalStatus !== "granted") {
		console.log("Push notification permission denied");
		return null;
	}

	const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
	if (!projectId) {
		console.log("No projectId configured - push notifications may fail on iOS!");
	}

	const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
	return tokenData.data;
}
