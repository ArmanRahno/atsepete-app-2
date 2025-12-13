import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
import { Bell } from "lucide-react-native";

import { usePermissionWarmup } from "@/components/PermissionWarmupDialog";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotifications";

const NOTIFICATION_TOKEN_ROUTE =
	"https://atsepete.net/api/application/notification/register-push-token";
const NOTIFICATION_INSTALL_ROUTE =
	"https://atsepete.net/api/application/notification/notification-token-on-install";

export function useAccountNotificationPermission() {
	const { showPermissionDialog } = usePermissionWarmup();

	const askAndStoreAccountPushToken = async () => {
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

		const perms = await Notifications.getPermissionsAsync();

		const doRegister = async () => {
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
				await AsyncStorage.setItem("isPushTokenStored", "true");
			}

			await AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
		};

		if (perms.status === "granted") {
			await doRegister();
			return;
		}

		if (!shouldAsk) return;

		if (perms.canAskAgain) {
			showPermissionDialog({
				mode: "request",
				title: "Bildirimleri Açmak İster misiniz?",
				description:
					"Takip ettiğiniz ürünlerdeki indirimler ve kazanç güncellemelerini size bildirebilmemiz için bildirim izni gereklidir.",
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
					} else {
						await AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
					}
				},
				onCancel: () => {
					AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
				}
			});

			return;
		}

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
				await AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
			},
			onCancel: () => {
				AsyncStorage.setItem("lastPermissionCheck", now.toISOString());
			}
		});
	};

	return { askAndStoreAccountPushToken };
}
