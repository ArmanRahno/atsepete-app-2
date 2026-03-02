import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "./registerForPushNotifications";

const REMOVE_NOTIFICATION_PUSH_TOKEN_ENDPOINT =
	"https://atsepete.net/api/application/notification/remove-push-token";

const removeNotificationToken = async () => {
	const token = await registerForPushNotificationsAsync();
	if (!token) {
		return;
	}

	const res = await fetch(REMOVE_NOTIFICATION_PUSH_TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token })
	});

	if (res.ok) {
		await AsyncStorage.removeItem("isPushTokenStored");
		await AsyncStorage.removeItem("lastPermissionCheck");
		await AsyncStorage.removeItem("lastPermissionCheckAppVersion");
		await AsyncStorage.removeItem("lastTokenRegisterVersion");
	}
};

export default removeNotificationToken;
