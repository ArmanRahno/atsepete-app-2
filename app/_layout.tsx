import toastConfig from "@/lib/toastConfig";
import "../global.css";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	useFonts,
	Roboto_400Regular,
	Roboto_500Medium,
	Roboto_700Bold,
	Roboto_100Thin,
	Roboto_300Light,
	Roboto_900Black
} from "@expo-google-fonts/roboto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotifications";
import * as Notifications from "expo-notifications";
import { getUserAgent } from "react-native-device-info";
import {
	getInstallationTimeAsync,
	getInstallReferrerAsync,
	nativeApplicationVersion,
	nativeBuildVersion
} from "expo-application";
import { Platform } from "react-native";
import NotificationColdStartNav from "@/components/NotificationColdStartNav";
import { pathFromPayload } from "@/lib/navFromNotification";

// const NOTIFICATION_TOKEN_API_URL =
// 	"https://atsepete.net/api/application/notification/notification-token-on-install";

// const INITIAL_LAUNCH_API_URL = "https://atsepete.net/api/application/initial-launch";

const NOTIFICATION_TOKEN_API_URL =
	"https://atsepete.net/api/application/notification/notification-token-on-install";

const INITIAL_LAUNCH_API_URL = "https://atsepete.net/api/application/initial-launch";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		priority: Notifications.AndroidNotificationPriority.HIGH
	})
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const notificationListener = useRef<Notifications.EventSubscription>(null);
	const responseListener = useRef<Notifications.EventSubscription>(null);
	const router = useRouter();

	let [fontsLoaded] = useFonts({
		Roboto_100Thin,
		Roboto_300Light,
		Roboto_400Regular,
		Roboto_500Medium,
		Roboto_700Bold,
		Roboto_900Black
	});

	useEffect(() => {
		// notificationListener.current = Notifications.addNotificationReceivedListener(
		// 	notification => {
		// 		console.log("Foreground notification received:", notification);
		// 	}
		// );

		responseListener.current = Notifications.addNotificationResponseReceivedListener(
			response => {
				const data = response.notification.request.content.data;

				if (!data || typeof data !== "object") return;

				const payload = data as any;

				if (payload.type === "NAVIGATE") {
					const path = pathFromPayload(payload);
					if (path) router.push(path as any);
				} else if (payload.type === "OPEN_WEBVIEW") {
					const url = payload.url;
					if (typeof url === "string") {
						router.push({
							pathname: "/webview",
							params: { url }
						});
					}
				}
			}
		);

		return () => {
			if (notificationListener.current) {
				notificationListener.current.remove();
			}

			if (responseListener.current) {
				responseListener.current.remove();
			}
		};
	}, []);

	useEffect(() => {
		if (fontsLoaded) SplashScreen.hideAsync();
	}, [fontsLoaded]);

	// useEffect(() => {
	//       const checkFirstLaunch = async () => {
	//          try {
	//             const hasLaunched = await AsyncStorage.getItem("hasLaunched");
	//             if (hasLaunched === null) {
	//                // TODO:
	//                // Ask for notification permission.
	//                // If granted, send it to NOTIFICATION_TOKEN_API_URL {token: ExpoPushToken}

	//                await AsyncStorage.setItem("hasLaunched", "true");
	//             }
	//          } catch (error) {
	//             console.error("Error checking first launch:", error);
	//          }
	//       };

	//       checkFirstLaunch();
	//    }, []);

	useEffect(() => {
		let userRandId: string | undefined;

		const logFirstLaunch = async () => {
			const hasLaunched = await AsyncStorage.getItem("hasLaunchedV2");

			if (hasLaunched) return;

			const app_user_agent = await getUserAgent();

			let play_store_install_referrer_string = null;
			let play_store_install_referrer_object = null;
			try {
				play_store_install_referrer_string =
					Platform.OS === "android" && (await getInstallReferrerAsync());

				play_store_install_referrer_object =
					play_store_install_referrer_string &&
					Object.fromEntries(new URLSearchParams(play_store_install_referrer_string));
			} catch (_) {}

			const app_build_version = nativeBuildVersion;

			const app_application_version = nativeApplicationVersion;

			const app_installation_time = await getInstallationTimeAsync();

			const res = await fetch(INITIAL_LAUNCH_API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					play_store_install_referrer_string,
					play_store_install_referrer_object,
					app_user_agent,
					app_build_version,
					app_application_version,
					app_installation_time
				})
			});

			const resJson = await res.json();

			userRandId = resJson.rand_id;

			const installReferrer =
				play_store_install_referrer_object &&
				play_store_install_referrer_object.install_referrer;

			await AsyncStorage.setItem("userId", resJson.userId || "");
			await AsyncStorage.setItem("userRandId", resJson.rand_id || "");
			installReferrer && (await AsyncStorage.setItem("referrer", installReferrer));
		};

		const registerPushToken = async () => {
			try {
				const hasLaunched = await AsyncStorage.getItem("hasLaunchedV2");

				if (!hasLaunched) {
					const expoToken = await registerForPushNotificationsAsync();
					if (expoToken) {
						await fetch(NOTIFICATION_TOKEN_API_URL, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ token: expoToken, rand_id: userRandId })
						});
					}

					await AsyncStorage.setItem("hasLaunchedV2", "true");
				}
			} catch (err) {
				console.error("Error registering for push notifications:", err);
			}
		};

		(async () => {
			await logFirstLaunch();
			await registerPushToken();
		})();
	}, []);

	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<ThemeProvider value={DefaultTheme}>
					<StatusBar style="dark" />
					<NotificationColdStartNav />
					<Stack>
						<Stack.Screen
							name="(tabs)"
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="(modals)"
							options={{ headerShown: false, presentation: "modal" }}
						/>
						<Stack.Screen name="+not-found" />
					</Stack>
					<Toast config={toastConfig} />
				</ThemeProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
