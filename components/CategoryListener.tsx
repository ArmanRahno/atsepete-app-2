import { cn } from "@/lib/utils";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { BellMinus, BellPlus } from "lucide-react-native";
import { ClassNameValue } from "tailwind-merge";
import addCategoryListener from "@/lib/addCategoryListener";
import AppTouchableOpacity from "./AppTouchableOpacity";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { router } from "expo-router";
import { useThemePalette } from "@/hooks/useThemePalette";

const CategoryListener = ({
	is_user_subscribed,
	category,
	className,
	size = 20,
	onListenerSuccess
}: {
	is_user_subscribed: boolean | undefined | null;
	category: Item["category"];
	className?: ClassNameValue;
	size?: number;
	onListenerSuccess?: () => void;
}) => {
	const { isDark } = useThemePalette();
	const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(is_user_subscribed || false);
	const [isListenerPending, setIsListenerPending] = useState<boolean>(false);
	const buttonColors = isUserSubscribed
		? {
				backgroundColor: isDark ? "rgba(6,78,59,0.72)" : "#ECFDF5",
				borderColor: isDark ? "rgba(52,211,153,0.45)" : "rgba(16,185,129,0.45)",
				iconColor: isDark ? "#A7F3D0" : "#047857"
			}
		: {
				backgroundColor: isDark ? "rgba(127,29,29,0.72)" : "#FEF2F2",
				borderColor: isDark ? "rgba(248,113,113,0.45)" : "rgba(239,68,68,0.45)",
				iconColor: isDark ? "#FECACA" : "#B91C1C"
			};

	const { ensureNotificationPermission, registerAccountPushTokenIfNeeded } =
		useNotificationPermission();

	return (
		<AppTouchableOpacity
			className={cn(
				"px-4 py-1 rounded-full border disabled:opacity-75 disabled:brightness-75 justify-center items-center",
				className
			)}
			style={{
				backgroundColor: buttonColors.backgroundColor,
				borderColor: buttonColors.borderColor
			}}
			hitSlop={16}
			disabled={isListenerPending}
			onPress={async () => {
				if (isListenerPending) return;

				try {
					setIsListenerPending(true);
					Toast.hide();

					const permResult = await ensureNotificationPermission({
						reason: "listener",
						onGrantedFromSettings: () => router.push("/alarms")
					});

					if (permResult === "denied") {
						Toast.show({
							type: "error",
							text1: "Bildirim izni olmadan alarm ekleyemezsiniz.",
							topOffset: 60
						});
						return;
					}

					if (permResult === "settings") {
						return;
					}

					const res = await addCategoryListener({ category, isUserSubscribed });

					if (!res.ok) {
						if (res.reason === "LOGIN") {
							Toast.show({
								type: "custom",
								text1: res.description,
								topOffset: 60
							});
							router.push("/alarms");
							return;
						}

						Toast.show({
							type: "error",
							text1: res.description,
							topOffset: 60
						});
						return;
					}

					setIsUserSubscribed(res.finalState);

					Toast.show({
						type: res.finalState ? "success" : "error",
						text1: res.description,
						topOffset: 60
					});

					if (res.finalState) {
						await registerAccountPushTokenIfNeeded();
					}

					onListenerSuccess?.();
				} catch (err) {
					console.error(err);
					Toast.show({
						type: "error",
						text1: "Bir hata oluştu",
						topOffset: 60
					});
				} finally {
					setIsListenerPending(false);
				}
			}}
		>
			{!isListenerPending && isUserSubscribed && (
				<BellMinus
					size={size}
					color={buttonColors.iconColor}
				/>
			)}
			{!isListenerPending && !isUserSubscribed && (
				<BellPlus
					size={size}
					color={buttonColors.iconColor}
				/>
			)}
			{isListenerPending && (
				<ActivityIndicator
					color={buttonColors.iconColor}
					size={size}
				/>
			)}
		</AppTouchableOpacity>
	);
};

export default CategoryListener;
