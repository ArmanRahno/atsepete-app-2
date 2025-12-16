import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
import { Bell } from "lucide-react-native";

import { usePermissionWarmup } from "@/components/PermissionWarmupDialog";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotifications";
import { nativeApplicationVersion } from "expo-application";
import { useCallback } from "react";

const NOTIFICATION_TOKEN_ROUTE =
	"https://atsepete.net/api/application/notification/register-push-token";
const NOTIFICATION_INSTALL_ROUTE =
	"https://atsepete.net/api/application/notification/notification-token-on-install";

type NotificationPromptReason = "startup" | "explicit" | "listener";

export function useNotificationPermission() {
	const { showPermissionDialog } = usePermissionWarmup();

	const askAndStoreAccountPushToken = useCallback(
		async (reason: NotificationPromptReason = "listener") => {
			const now = new Date();
			const currentVersion = nativeApplicationVersion ?? "unknown";

			const perms = await Notifications.getPermissionsAsync();

			const [lastCheckString, lastCheckVersion, lastRegisterVersion] = await Promise.all([
				AsyncStorage.getItem("lastPermissionCheck"),
				AsyncStorage.getItem("lastPermissionCheckAppVersion"),
				AsyncStorage.getItem("lastTokenRegisterVersion")
			]);

			const alreadyCheckedThisVersion =
				!!lastCheckString && lastCheckVersion === currentVersion;

			console.log("[notif perms]", {
				reason,
				status: perms.status,
				canAskAgain: perms.canAskAgain,
				lastCheckString,
				lastCheckVersion,
				lastRegisterVersion,
				currentVersion,
				alreadyCheckedThisVersion
			});

			const markPermissionCheck = async () => {
				await AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
				await AsyncStorage.setItem("lastPermissionCheckAppVersion", currentVersion);
			};

			const markRegister = async () => {
				await AsyncStorage.setItem("lastTokenRegisterVersion", currentVersion);
			};

			const doRegister = async () => {
				const token = await registerForPushNotificationsAsync();
				if (!token) {
					// We still mark this as a check so we don't spam the dialog.
					await markPermissionCheck();
					return;
				}

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
					await markRegister();
				}
			};

			// 1) Already granted → just sync token for this version if needed.
			if (perms.status === "granted") {
				if (lastRegisterVersion !== currentVersion) {
					await doRegister();
				}
				return;
			}

			// 2) STARTUP: only once per app version, regardless of cooldown.
			if (reason === "startup" && alreadyCheckedThisVersion) {
				return;
			}

			// 3) Cooldown logic (only for non-explicit reasons).
			let shouldAsk = true;
			const COOLDOWN_HOURS = 72;

			if (reason !== "explicit" && perms.status !== "undetermined" && lastCheckString) {
				const lastCheckDate = new Date(lastCheckString);
				const hoursDiff = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60);

				// Only enforce cooldown if we already asked in this version.
				if (hoursDiff < COOLDOWN_HOURS && alreadyCheckedThisVersion) {
					shouldAsk = false;
				}
			}

			if (reason !== "explicit" && !shouldAsk) {
				return;
			}

			const canShowRequest = perms.status === "undetermined" || perms.canAskAgain;

			// 4) We can still show the OS permission dialog.
			if (canShowRequest) {
				showPermissionDialog({
					mode: "request",
					title: "Bildirimleri Açmak İster misiniz?",
					description:
						"Takip ettiğiniz ürünlerdeki indirimler ve kazanç güncellemelerini size iletebilmemiz için bildirim izni gereklidir.",
					bulletPoints: [
						"Takip ettiğiniz ürünlerdeki indirimlerden anında haberdar olun",
						"Kurduğunuz alarmlardaki fiyat değişikliklerini kaçırmayın",
						"Davet linklerinden elde ettiğiniz kazancı kolayca takip edin"
					],
					icon: (
						<Bell
							size={32}
							color="#fff"
						/>
					),
					onConfirm: async () => {
						const res = await Notifications.requestPermissionsAsync();

						if (res.status === "granted") {
							await doRegister();
						}

						await markPermissionCheck();
					},
					onCancel: () => {
						markPermissionCheck();
					}
				});

				return;
			}

			// 5) Permission is denied and blocked at OS level → settings dialog.
			// For Google Play friendliness we NEVER do this on plain startup.
			if (reason !== "startup" && perms.status === "denied" && !perms.canAskAgain) {
				showPermissionDialog({
					mode: "settings",
					title: "Bildirim İzni Kapalı",
					description:
						"İndirim ve kazanç bildirimlerini alabilmeniz için bildirim iznini cihaz ayarlarından yeniden açmanız gereklidir.",
					bulletPoints: [
						"Takip ettiğiniz ürünlerdeki indirimlerden zamanında haberdar olun",
						"Kurduğunuz alarmlardaki değişiklikleri kaçırmayın",
						"Kazançlardaki güncellemeleri düzenli olarak takip edin"
					],
					icon: (
						<Bell
							size={32}
							color="#fff"
						/>
					),
					note: "Bildirim izni daha önce reddedilmiştir. Bu özelliklerden yararlanabilmek için uygulama ayarlarından bildirimlere yeniden izin vermeniz gereklidir.",
					primaryLabel: "Uygulama ayarlarını aç",
					onConfirm: async () => {
						await Linking.openSettings();
						await markPermissionCheck();
					},
					onCancel: () => {
						markPermissionCheck();
					}
				});
			}
		},
		[showPermissionDialog]
	);

	return { askAndStoreAccountPushToken };
}
