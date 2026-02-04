import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { NotificationChannelSettingsSchema } from "@/zod-schemas/notification-settings";
import NotificationSettingsForm from "@/components/account-page/NotificationSettingsForm";
import { Undo2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import LoadingIndicator from "@/components/LoadingIndicator";

const API_BASE = "https://atsepete.net";

type Channel = "app" | "email";

const stableStringify = (v: any) => {
	try {
		const sort = (x: any): any => {
			if (Array.isArray(x)) return x.map(sort);
			if (x && typeof x === "object") {
				return Object.keys(x)
					.sort()
					.reduce((acc: any, k) => {
						acc[k] = sort(x[k]);
						return acc;
					}, {});
			}
			return x;
		};
		return JSON.stringify(sort(v));
	} catch {
		return "";
	}
};

export default function BildirimAyarlariModal() {
	const [channel, setChannel] = useState<Channel>("app");
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);

	const [settingsApp, setSettingsApp] = useState<any>(null);
	const [settingsEmail, setSettingsEmail] = useState<any>(null);

	const [initialApp, setInitialApp] = useState<any>(null);
	const [initialEmail, setInitialEmail] = useState<any>(null);

	const active = useMemo(() => {
		return channel === "app" ? settingsApp : settingsEmail;
	}, [channel, settingsApp, settingsEmail]);

	const initialActive = useMemo(() => {
		return channel === "app" ? initialApp : initialEmail;
	}, [channel, initialApp, initialEmail]);

	const setActive = useCallback(
		(patch: any) => {
			if (channel === "app") setSettingsApp((prev: any) => ({ ...(prev ?? {}), ...patch }));
			else setSettingsEmail((prev: any) => ({ ...(prev ?? {}), ...patch }));
		},
		[channel]
	);

	const toastErr = useCallback((msg: string, type: "error" | "custom" = "error") => {
		Toast.hide();
		Toast.show({
			type,
			text1: msg,
			topOffset: 60
		});
	}, []);

	const load = useCallback(async () => {
		try {
			setLoading(true);

			const curSession = await AsyncStorage.getItem("user-session-token");
			if (!curSession) return;

			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${curSession}`
			};

			const r = await fetch(`${API_BASE}/api/application/page/user-page?earnings=false`, {
				headers
			});

			const res = await r.json().catch(() => null);
			if (!r.ok || !res) return;

			if (res.status === "error" && res.code === "LOGIN_REQUIRED") return;

			const appParsed = NotificationChannelSettingsSchema.safeParse(
				res?.notification_settings?.app ?? {}
			);
			const emailParsed = NotificationChannelSettingsSchema.safeParse(
				res?.notification_settings?.email ?? {}
			);

			const appSettings = appParsed.success
				? appParsed.data
				: NotificationChannelSettingsSchema.parse({});
			const emailSettings = emailParsed.success
				? emailParsed.data
				: NotificationChannelSettingsSchema.parse({});

			setSettingsApp(appSettings);
			setSettingsEmail(emailSettings);

			setInitialApp(appSettings);
			setInitialEmail(emailSettings);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		load();
	}, [load]);

	const isDirty = useMemo(() => {
		const a = active ?? NotificationChannelSettingsSchema.parse({});
		const b = initialActive ?? NotificationChannelSettingsSchema.parse({});
		return stableStringify(a) !== stableStringify(b);
	}, [active, initialActive]);

	const canSave = !loading && !saving && isDirty;

	const resetActive = useCallback(() => {
		const snap = initialActive ?? NotificationChannelSettingsSchema.parse({});
		if (channel === "app") setSettingsApp(snap);
		else setSettingsEmail(snap);

		Toast.hide();
		Toast.show({
			type: "custom",
			text1: "Değişiklikler sıfırlandı.",
			topOffset: 60
		});
	}, [channel, initialActive]);

	const save = useCallback(async () => {
		if (saving) return;
		if (!isDirty) return;

		setSaving(true);
		try {
			Toast.hide();

			const payload = {
				channel,
				settings: active ?? NotificationChannelSettingsSchema.parse({})
			};

			const curSession = await AsyncStorage.getItem("user-session-token");
			if (!curSession) {
				toastErr("Tekrar giriş yapmanız gerekiyor.", "custom");
				return;
			}

			const r = await fetch(`${API_BASE}/api/application/action/save-notification-settings`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${curSession}`
				},
				body: JSON.stringify(payload)
			});

			const res = await r.json().catch(() => null);

			if (!r.ok || !res || res.status === "error") {
				if (res?.code === "LOGIN_REQUIRED") {
					toastErr("Tekrar giriş yapmanız gerekiyor.", "custom");
					return;
				}
				toastErr(res?.message || "Bir hata oluştu.");
				return;
			}

			if (channel === "app") {
				setInitialApp(payload.settings);
				setSettingsApp(payload.settings);
			} else {
				setInitialEmail(payload.settings);
				setSettingsEmail(payload.settings);
			}

			Toast.show({
				type: "success",
				text1: "Bildirim ayarlarınız güncellendi.",
				topOffset: 60
			});

			setTimeout(() => {
				router.back();
			}, 250);
		} catch (e) {
			console.error(e);
			toastErr("Bir hata oluştu.");
		} finally {
			setSaving(false);
		}
	}, [active, channel, saving, toastErr, isDirty]);

	return (
		<View className="flex-1 bg-background">
			<Header>
				<View className="flex-row items-center justify-between">
					<View className="w-10" />
					<View className="flex-1 items-center">
						<HeaderText>Bildirim Ayarları</HeaderText>
					</View>

					<AppTouchableOpacity
						onPress={() => router.back()}
						disabled={saving}
						hitSlop={16}
						className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
					>
						<Undo2 size={22} />
					</AppTouchableOpacity>
				</View>
			</Header>

			{loading ? (
				<LoadingIndicator />
			) : (
				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
					keyboardShouldPersistTaps="handled"
				>
					<View className="gap-4">
						<View className="flex-row gap-2">
							<AppTouchableOpacity
								className={`flex-1 py-2.5 rounded-lg border ${
									channel === "app"
										? "bg-primary border-primary"
										: "bg-background border-border"
								}`}
								onPress={() => setChannel("app")}
								disabled={saving}
							>
								<Text
									className={`text-center font-semibold ${
										channel === "app"
											? "text-primary-foreground"
											: "text-foreground"
									}`}
								>
									Uygulama
								</Text>
							</AppTouchableOpacity>

							<AppTouchableOpacity
								className={`flex-1 py-2.5 rounded-lg border ${
									channel === "email"
										? "bg-primary border-primary"
										: "bg-background border-border"
								}`}
								onPress={() => setChannel("email")}
								disabled={saving}
							>
								<Text
									className={`text-center font-semibold ${
										channel === "email"
											? "text-primary-foreground"
											: "text-foreground"
									}`}
								>
									E-posta
								</Text>
							</AppTouchableOpacity>
						</View>

						<NotificationSettingsForm
							value={active}
							onChange={setActive}
							disabled={saving}
						/>

						<View className="gap-2 mt-2">
							<AppTouchableOpacity
								className={`rounded-lg py-3 flex-row justify-center items-center ${
									canSave ? "bg-primary" : "bg-primary opacity-50"
								}`}
								onPress={save}
								disabled={!canSave}
							>
								{saving ? (
									<ActivityIndicator color="white" />
								) : (
									<Text className="text-primary-foreground font-semibold">
										Kaydet
									</Text>
								)}
							</AppTouchableOpacity>

							<AppTouchableOpacity
								className={`bg-background border border-border rounded-lg py-3 flex-row justify-center items-center ${
									isDirty ? "" : "opacity-50"
								}`}
								onPress={resetActive}
								disabled={!isDirty || saving}
							>
								<Text className="text-secondary-foreground font-semibold">
									Sıfırla
								</Text>
							</AppTouchableOpacity>

							<AppTouchableOpacity
								className="bg-secondary rounded-lg py-3 flex-row justify-center items-center"
								onPress={() => router.back()}
								disabled={saving}
							>
								<Text className="text-secondary-foreground font-semibold">
									Geri Dön
								</Text>
							</AppTouchableOpacity>
						</View>
					</View>
				</ScrollView>
			)}
		</View>
	);
}
