import { useCallback, useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import LoadingIndicator from "@/components/LoadingIndicator";
import LoginAndRegisterFormsWrapper from "@/components/forms/LoginAndRegisterFormsWrapper";
import EarningsList from "@/components/account-page/EarningsList";
import AccountSettings from "@/components/account-page/AccountSettings";
import Header from "@/components/header/Header";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { AccountAPIResponse } from "./alarms";
import LogOutBtn from "@/components/account-page/LogOutBtn";
import DeleteAccountBtn from "@/components/account-page/DeleteAccountBtn";
import PaymentOptions from "@/components/account-page/PaymentOptions";
import VersionInfo from "@/components/VersionInfo";
import NotificationSettingsForm from "@/components/account-page/NotificationSettingsForm";

const REFERRER_CODE_KEY = "user-referrer-code";

function RowButton({
	title,
	subtitle,
	onPress
}: {
	title: string;
	subtitle?: string;
	onPress: () => void;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.85}
			className="w-full flex-row items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
		>
			<View className="flex-1 pr-3">
				<Text className="text-foreground font-semibold">{title}</Text>
				{subtitle ? (
					<Text className="text-muted-foreground text-xs mt-1">{subtitle}</Text>
				) : null}
			</View>

			<Text className="text-muted-foreground font-semibold">›</Text>
		</TouchableOpacity>
	);
}

export default function AccountScreen() {
	const [userData, setUserData] = useState<AccountAPIResponse | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	const fetchUserPage = useCallback(async () => {
		try {
			setLoading(true);
			setIsLoggedIn(false);
			setUserData(null);

			const curSession = await AsyncStorage.getItem("user-session-token");
			if (!curSession) {
				await AsyncStorage.removeItem(REFERRER_CODE_KEY);
				return;
			}

			const response = await fetch(
				"https://atsepete.net/api/application/page/user-page?alarms=false",
				{ credentials: "include" }
			);

			if (!response.ok) {
				throw new Error("Error fetching items");
			}

			const data: AccountAPIResponse = await response.json();

			if (data.status === "error" || data.code === "LOGIN_REQUIRED") {
				setIsLoggedIn(false);
				await AsyncStorage.removeItem(REFERRER_CODE_KEY);
				return;
			}

			setIsLoggedIn(true);
			setUserData(data);

			const refCode = (data as any).user?.referrer_code ?? (data as any).referrer_code;

			if (refCode) {
				await AsyncStorage.setItem(REFERRER_CODE_KEY, refCode);
			} else {
				await AsyncStorage.removeItem(REFERRER_CODE_KEY);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchUserPage();
		}, [fetchUserPage])
	);

	const canChangePassword = useMemo(() => {
		return Boolean((userData as any)?.auth?.canChangePassword);
	}, [userData]);

	const goNotificationSettings = useCallback(() => {
		router.push("/(modals)/notification-settings");
	}, []);

	const goChangePassword = useCallback(() => {
		router.push("/(tabs)/account-change-password");
	}, []);

	if (loading) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow />
			</Header>

			{isLoggedIn && userData && (
				<ScrollView>
					<View className="p-2">
						<View className="bg-background p-3 gap-4">
							<AccountSettings userData={userData} />

							<EarningsList earnings={userData.earnings} />

							<PaymentOptions paymentData={userData.payment_data} />

							<View className="mt-4">
								<View className="mb-2">
									<Text className="text-foreground font-semibold text-base">
										Hesap Ayarları
									</Text>
									<Text className="text-muted-foreground text-xs mt-1">
										Bildirim, oturum ve güvenlik ayarları
									</Text>
								</View>

								<View className="gap-2">
									<RowButton
										title="Bildirim Ayarları"
										subtitle="Uygulama ve e-posta bildirimlerini yönet"
										onPress={goNotificationSettings}
									/>

									{canChangePassword && (
										<RowButton
											title="Şifre Değiştir"
											subtitle="Şifrenizi değiştirmek için tıklayın"
											onPress={goChangePassword}
										/>
									)}
								</View>
							</View>

							<View className="flex-row justify-between">
								<DeleteAccountBtn />

								<LogOutBtn
									setIsLoggedIn={setIsLoggedIn}
									setUserData={setUserData}
									setLoading={setLoading}
								/>
							</View>
						</View>
						<VersionInfo />
					</View>
				</ScrollView>
			)}

			{!isLoggedIn && <LoginAndRegisterFormsWrapper onSuccess={fetchUserPage} />}
		</>
	);
}
