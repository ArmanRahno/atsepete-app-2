import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "./registerForPushNotifications";

const REMOVE_NOTIFICATION_PUSH_TOKEN_ENDPOINT =
	"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/notification/remove-push-token";

const removeNotificationToken = async () => {
	const token = await registerForPushNotificationsAsync();
	if (!token) {
		return;
	}

	// User must be logged in; the session cookie must be set.
	const res = await fetch(REMOVE_NOTIFICATION_PUSH_TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token })
	});

	await AsyncStorage.removeItem("isPushTokenStored");
	await AsyncStorage.removeItem("lastPermissionCheck");
};

export default removeNotificationToken;
