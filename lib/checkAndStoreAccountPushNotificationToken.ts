// e.g. app/hooks/useCheckNotificationPermission.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "./registerForPushNotifications";

const NOTIFICATION_TOKEN_ROUTE =
	"https://atsepete.net/api/application/notification/register-push-token";

const checkAndStoreAccountPushNotificationToken = async () => {
	try {
		const isPushTokenStored = await AsyncStorage.getItem("isPushTokenStored");

		if (isPushTokenStored === "true") return;

		const lastCheckString = await AsyncStorage.getItem("lastPermissionCheck");
		const now = new Date();

		let shouldAsk = true;

		if (lastCheckString) {
			const lastCheckDate = new Date(lastCheckString);
			const hoursDiff = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60);
			if (hoursDiff < 24) {
				shouldAsk = false;
			}
		}

		if (shouldAsk) {
			const token = await registerForPushNotificationsAsync();
			if (!token) {
				return;
			}

			// User must be logged in; the session cookie must be set.
			const res = await fetch(NOTIFICATION_TOKEN_ROUTE, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token })
			});

			if (res.ok) {
				await AsyncStorage.setItem("isPushTokenStored", "true");
			}

			await AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
		}
	} catch (err) {
		console.error("Error checking/ registering push token:", err);
	}
};

export default checkAndStoreAccountPushNotificationToken;
