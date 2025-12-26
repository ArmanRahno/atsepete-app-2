import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Linking, AppState } from "react-native";
import { Bell } from "lucide-react-native";
import { nativeApplicationVersion } from "expo-application";
import { useCallback, useEffect, useRef } from "react";

import { usePermissionWarmup } from "@/components/PermissionWarmupDialog";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotifications";

const NOTIFICATION_TOKEN_ROUTE =
	"https://atsepete.net/api/application/notification/register-push-token";
const NOTIFICATION_INSTALL_ROUTE =
	"https://atsepete.net/api/application/notification/notification-token-on-install";

type NotificationPromptReason = "startup" | "explicit" | "listener";
export type EnsurePermissionResult = "granted" | "denied" | "settings" | "skipped";

const isGranted = (perm: any) => perm?.granted === true || perm?.status === "granted";

export function useNotificationPermission() {
	const { showPermissionDialog } = usePermissionWarmup();

	const pendingAfterSettingsRef = useRef(false);
	const appStateRef = useRef(AppState.currentState);
	const onGrantedFromSettingsRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const sub = AppState.addEventListener("change", async nextState => {
			const wasBg = appStateRef.current.match(/inactive|background/);
			const isNowActive = nextState === "active";

			if (wasBg && isNowActive && pendingAfterSettingsRef.current) {
				pendingAfterSettingsRef.current = false;

				const perm = await Notifications.getPermissionsAsync();
				if (isGranted(perm)) {
					onGrantedFromSettingsRef.current?.();
				}

				onGrantedFromSettingsRef.current = null;
			}

			appStateRef.current = nextState;
		});

		return () => sub.remove();
	}, []);

	const registerAccountPushTokenIfNeeded = useCallback(async () => {
		const currentVersion = nativeApplicationVersion ?? "unknown";

		const perms = await Notifications.getPermissionsAsync();
		if (!isGranted(perms)) return;

		const lastRegisterVersion = await AsyncStorage.getItem("lastTokenRegisterVersion");
		if (lastRegisterVersion === currentVersion) return;

		const token = await registerForPushNotificationsAsync();
		if (!token) return;

		const res = await fetch(NOTIFICATION_TOKEN_ROUTE, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token })
		});

		const userRandId = await AsyncStorage.getItem("userRandId");
		if (userRandId) {
			await fetch(NOTIFICATION_INSTALL_ROUTE, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, rand_id: userRandId })
			});
		}

		if (res.ok) {
			await AsyncStorage.setItem("lastTokenRegisterVersion", currentVersion);
		}
	}, []);

	const ensureNotificationPermission = useCallback(
		async ({
			reason = "listener",
			onGrantedFromSettings
		}: {
			reason?: NotificationPromptReason;
			onGrantedFromSettings?: () => void;
		} = {}): Promise<EnsurePermissionResult> => {
			const now = new Date();
			const currentVersion = nativeApplicationVersion ?? "unknown";

			const perms = await Notifications.getPermissionsAsync();
			if (isGranted(perms)) return "granted";

			const [lastCheckString, lastCheckVersion] = await Promise.all([
				AsyncStorage.getItem("lastPermissionCheck"),
				AsyncStorage.getItem("lastPermissionCheckAppVersion")
			]);

			const alreadyCheckedThisVersion =
				!!lastCheckString && lastCheckVersion === currentVersion;

			const markPermissionCheck = async () => {
				await AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
				await AsyncStorage.setItem("lastPermissionCheckAppVersion", currentVersion);
			};

			if (reason === "startup" && alreadyCheckedThisVersion) {
				return "skipped";
			}

			const canShowRequest = perms.status === "undetermined" || perms.canAskAgain;

			if (canShowRequest) {
				return await new Promise<EnsurePermissionResult>(resolve => {
					showPermissionDialog({
						mode: "request",
						title: "Bildirimleri Açmak İster misiniz?",
						description:
							"Alarm ekleyebilmeniz için bildirim izni gereklidir. Böylece takip ettiğiniz ürünlerdeki fiyat değişikliklerini anında size iletebiliriz.",
						bulletPoints: [
							"İndirimleri anında öğrenin",
							"Fiyat değişikliklerini kaçırmayın"
						],
						icon: (
							<Bell
								size={32}
								color="#fff"
							/>
						),
						onConfirm: async () => {
							const res = await Notifications.requestPermissionsAsync();
							await markPermissionCheck();
							resolve(isGranted(res) ? "granted" : "denied");
						},
						onCancel: async () => {
							await markPermissionCheck();
							resolve("denied");
						}
					});
				});
			}

			if (perms.status === "denied" && !perms.canAskAgain) {
				return await new Promise<EnsurePermissionResult>(resolve => {
					showPermissionDialog({
						mode: "settings",
						title: "Bildirim İzni Kapalı",
						description:
							"Alarm ekleyebilmeniz için bildirim iznini ayarlardan açmanız gerekiyor.",
						bulletPoints: ["Bildirimleri açın", "Uygulamaya dönüp tekrar deneyin"],
						icon: (
							<Bell
								size={32}
								color="#fff"
							/>
						),
						note: "Bildirim izni kapalı olduğu için alarm eklenemiyor.",
						primaryLabel: "Uygulama ayarlarını aç",
						onConfirm: async () => {
							onGrantedFromSettingsRef.current = onGrantedFromSettings ?? null;
							pendingAfterSettingsRef.current = true;
							await markPermissionCheck();
							await Linking.openSettings();
							resolve("settings");
						},
						onCancel: async () => {
							await markPermissionCheck();
							resolve("denied");
						}
					});
				});
			}

			return "denied";
		},
		[showPermissionDialog]
	);

	const askAndStoreAccountPushToken = useCallback(
		async (reason: NotificationPromptReason = "listener") => {
			const result = await ensureNotificationPermission({ reason });
			if (result === "granted") {
				await registerAccountPushTokenIfNeeded();
			}
		},
		[ensureNotificationPermission, registerAccountPushTokenIfNeeded]
	);

	return {
		ensureNotificationPermission,
		registerAccountPushTokenIfNeeded,
		askAndStoreAccountPushToken
	};
}
