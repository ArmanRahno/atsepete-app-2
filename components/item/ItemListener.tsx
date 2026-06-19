import addItemListener from "@/lib/addItemListener";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState } from "react-native";
import Toast from "react-native-toast-message";
import { Bell, BellMinus, BellPlus } from "lucide-react-native";
import { ClassNameValue } from "tailwind-merge";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { usePermissionWarmup } from "../PermissionWarmupDialog";
import { openSettings } from "expo-linking";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useThemePalette } from "@/hooks/useThemePalette";
import { useAlarmSubscriptions } from "@/hooks/useAlarmSubscriptions";

const isGranted = (perm: any) => perm?.granted === true || perm?.status === "granted";

type ListenerItem = Item & {
	is_user_subscribed?: boolean;
	isUserNotificationActive?: boolean;
};

type ItemListenerProps = {
	item: ListenerItem;
	className?: ClassNameValue;
	onListenerSuccess?: (itemId: string, finalState: boolean) => void;
	initIsActive?: boolean;
};

const ItemListener = ({ item, className, onListenerSuccess, initIsActive }: ItemListenerProps) => {
	const { colors } = useThemePalette();
	const { isItemSubscribed, setItemSubscribed } = useAlarmSubscriptions();
	const itemId = item._id.toString();
	const itemPropSubscribed = initIsActive ?? !!(item.is_user_subscribed || item.isUserNotificationActive);
	const sharedSubscriptionState = isItemSubscribed(itemId);
	const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(
		sharedSubscriptionState ?? itemPropSubscribed
	);
	const [isListenerPending, setIsListenerPending] = useState<boolean>(false);

	useEffect(() => {
		setIsUserSubscribed(sharedSubscriptionState ?? itemPropSubscribed);
	}, [itemPropSubscribed, sharedSubscriptionState]);

	const isDarkMode =
		colors.background?.toLowerCase?.() === "#0c0a08" ||
		colors.card?.toLowerCase?.() === "#1f1a16";

	const listenerButtonColors = isUserSubscribed
		? {
				backgroundColor: isDarkMode ? "rgba(16,185,129,0.25)" : "rgba(209,250,229,0.90)",
				borderColor: isDarkMode ? "rgba(52,211,153,0.30)" : "rgba(5,150,105,0.45)",
				iconColor: isDarkMode ? "#6EE7B7" : "#047857",
				shadowColor: "rgba(16,185,129,0.20)"
			}
		: {
				backgroundColor: isDarkMode ? "rgba(239,68,68,0.25)" : "rgba(255,228,230,0.90)",
				borderColor: isDarkMode ? "rgba(248,113,113,0.30)" : "rgba(225,29,72,0.40)",
				iconColor: isDarkMode ? "#FCA5A5" : "#BE123C",
				shadowColor: "rgba(239,68,68,0.20)"
			};

	const { askAndStoreAccountPushToken } = useNotificationPermission();
	const { showPermissionDialog } = usePermissionWarmup();

	const appStateRef = useRef(AppState.currentState);

	const pendingAfterSettingsRef = useRef(false);
	const settingsResolveRef = useRef<((v: boolean) => void) | null>(null);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", async nextState => {
			const wasBg = appStateRef.current.match(/inactive|background/);
			const isNowActive = nextState === "active";

			if (wasBg && isNowActive && pendingAfterSettingsRef.current) {
				pendingAfterSettingsRef.current = false;

				const perm = await Notifications.getPermissionsAsync();
				const grantedNow = isGranted(perm);

				const resolve = settingsResolveRef.current;
				settingsResolveRef.current = null;
				resolve?.(grantedNow);

				if (grantedNow) {
					router.push("/alarms");
				}
			}

			appStateRef.current = nextState;
		});

		return () => subscription.remove();
	}, []);

	const ensureNotificationPermission = async (): Promise<boolean> => {
		const perm = await Notifications.getPermissionsAsync();
		if (isGranted(perm)) return true;

		if (perm?.canAskAgain) {
			return await new Promise<boolean>(resolve => {
				let settled = false;

				const settle = (v: boolean) => {
					if (settled) return;
					settled = true;
					resolve(v);
				};

				showPermissionDialog({
					mode: "request",
					primaryLabel: "Bildirimlere Devam Et",
					title: "Bildirimleri Açmak İster misiniz?",
					description:
						"Ürün alarmı ekleyebilmeniz için bildirim izni gereklidir. Böylece takip ettiğiniz ürünlerdeki fiyat değişikliklerini anında size iletebiliriz.",
					bulletPoints: [
						"Takip ettiğiniz ürünlerdeki indirimlerden anında haberdar olun",
						"Kurduğunuz alarmlardaki fiyat değişikliklerini kaçırmayın"
					],
					icon: (
						<Bell
							size={32}
							color="#fff"
						/>
					),
					onConfirm: async () => {
						const res = await Notifications.requestPermissionsAsync();
						settle(isGranted(res));
					},
					onCancel: () => settle(false)
				});

				setTimeout(() => settle(false), 8000);
			});
		}

		return await new Promise<boolean>(resolve => {
			settingsResolveRef.current = resolve;

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
					pendingAfterSettingsRef.current = true;
					await openSettings();
				},
				onCancel: () => {
					const r = settingsResolveRef.current;
					settingsResolveRef.current = null;
					r?.(false);
				}
			});

			setTimeout(() => {
				if (settingsResolveRef.current) {
					const r = settingsResolveRef.current;
					settingsResolveRef.current = null;
					r(false);
				}
			}, 20000);
		});
	};

	return (
		<AppTouchableOpacity
			className={cn(
				"items-center justify-center rounded-full border px-4 py-2 disabled:opacity-75 disabled:brightness-75",
				className
			)}
			style={{
				backgroundColor: listenerButtonColors.backgroundColor,
				borderColor: listenerButtonColors.borderColor,
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 6,
				elevation: 4
			}}
			hitSlop={10}
			disabled={isListenerPending}
			onPress={async () => {
				if (isListenerPending) return;

				try {
					setIsListenerPending(true);
					Toast.hide();

					const granted = await ensureNotificationPermission();
					if (!granted) {
						Toast.show({
							type: "error",
							text1: "Bildirim izni olmadan alarm ekleyemezsiniz.",
							topOffset: 60
						});
						return;
					}

					const res = await addItemListener({ item, isUserSubscribed });

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
						await askAndStoreAccountPushToken("listener");
					}

					setItemSubscribed(item, res.finalState);
					onListenerSuccess?.(itemId, res.finalState);
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
					size={20}
					color={listenerButtonColors.iconColor}
				/>
			)}

			{!isListenerPending && !isUserSubscribed && (
				<BellPlus
					size={20}
					color={listenerButtonColors.iconColor}
				/>
			)}

			{isListenerPending && <ActivityIndicator color={listenerButtonColors.iconColor} />}
		</AppTouchableOpacity>
	);
};

export default ItemListener;
