import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { BellRing } from "lucide-react-native";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { auth } from "@/lib/auth/firebase";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useThemePalette } from "@/hooks/useThemePalette";

const API_BASE = "https://atsepete.net";
const APP_REVIEW_EMAIL = "atsepetenet@gmail.com";
const REVIEW_DEMO_NOTIFICATION_ENDPOINT =
	`${API_BASE}/api/application/notification/send-review-demo-notification`;

type ReviewDemoNotificationButtonProps = {
	accountEmail?: string | null;
};

export default function ReviewDemoNotificationButton({
	accountEmail
}: ReviewDemoNotificationButtonProps) {
	const [sendingDemo, setSendingDemo] = useState(false);
	const { colors, isDark } = useThemePalette();
	const { ensureNotificationPermission, registerAccountPushTokenIfNeeded } =
		useNotificationPermission();

	const canSendReviewDemo = useMemo(() => {
		const email = accountEmail || auth.currentUser?.email;
		return email?.trim().toLowerCase() === APP_REVIEW_EMAIL;
	}, [accountEmail]);

	const toastErr = useCallback((msg: string, type: "error" | "custom" = "error") => {
		Toast.hide();
		Toast.show({
			type,
			text1: msg,
			topOffset: 60
		});
	}, []);

	const sendTestNotification = useCallback(async () => {
		if (sendingDemo) return;

		setSendingDemo(true);
		try {
			Toast.hide();

			const permResult = await ensureNotificationPermission({ reason: "explicit" });
			if (permResult === "denied" || permResult === "skipped") {
				toastErr("Test bildirimi için bildirim izni gerekiyor.", "custom");
				return;
			}

			if (permResult === "settings") return;

			await registerAccountPushTokenIfNeeded();

			const curSession = await AsyncStorage.getItem("user-session-token");
			if (!curSession) {
				toastErr("Tekrar giriş yapmanız gerekiyor.", "custom");
				return;
			}

			const response = await fetch(REVIEW_DEMO_NOTIFICATION_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${curSession}`
				},
				body: JSON.stringify({
					email: APP_REVIEW_EMAIL,
					source: "app-review-demo"
				})
			});

			const result = await response.json().catch(() => null);

			if (!response.ok || result?.status === "error") {
				toastErr(result?.message || "Test bildirimi gönderilemedi.");
				return;
			}

			Toast.show({
				type: "success",
				text1: "Test bildirimi gönderildi.",
				text2: "Bildirime dokununca ürün detayı açılır.",
				topOffset: 60
			});
		} catch (e) {
			console.error(e);
			toastErr("Test bildirimi gönderilemedi.");
		} finally {
			setSendingDemo(false);
		}
	}, [
		ensureNotificationPermission,
		registerAccountPushTokenIfNeeded,
		sendingDemo,
		toastErr
	]);

	if (!canSendReviewDemo) return null;

	return (
		<AppTouchableOpacity
			className={`w-full flex-row items-center rounded-xl border border-border bg-card px-4 py-3 ${
				sendingDemo ? "justify-center" : "gap-3"
			} ${
				sendingDemo ? "opacity-60" : ""
			}`}
			onPress={sendTestNotification}
			disabled={sendingDemo}
		>
			{sendingDemo ? (
				<ActivityIndicator />
			) : (
				<>
					<BellRing
						size={18}
						color={isDark ? "#FFFFFF" : colors.text}
						strokeWidth={2.4}
					/>
					<View className="flex-1">
						<Text className="text-foreground font-semibold">
							App Review Demo Bildirimi
						</Text>
						<Text className="text-muted-foreground text-xs mt-1">
							Test hesabı için gerçek fiyat alarmı bildirimi gönderir.
						</Text>
					</View>
				</>
			)}
		</AppTouchableOpacity>
	);
}
