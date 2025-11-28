import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import LoadingIndicator from "@/components/LoadingIndicator";
import LoginAndRegisterFormsWrapper from "@/components/forms/LoginAndRegisterFormsWrapper";
import EarningsList from "@/components/account-page/EarningsList";
import AccountSettings from "@/components/account-page/AccountSettings";
import Header from "@/components/header/Header";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { AccountAPIResponse } from "./alarms";
import { Text } from "react-native";
import Constants from "expo-constants";
import LogOutBtn from "@/components/account-page/LogOutBtn";
import DeleteAccountBtn from "@/components/account-page/DeleteAccountBtn";
import PaymentOptions from "@/components/account-page/PaymentOptions";

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
			if (!curSession) return;

			const response = await fetch(
				"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/page/user-page?alarms=false"
			);

			if (!response.ok) {
				throw new Error("Error fetching items");
			}

			const data: AccountAPIResponse = await response.json();

			if (data.status === "error" || data.code === "LOGIN_REQUIRED") {
				setIsLoggedIn(false);
				return;
			}

			setIsLoggedIn(true);

			setUserData(data);
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

							<LogOutBtn
								setIsLoggedIn={setIsLoggedIn}
								setUserData={setUserData}
								setLoading={setLoading}
							/>

							<DeleteAccountBtn />
						</View>
						<Text className="mt-1 text-xs text-muted-foreground">
							AtSepete @2025, v{Constants.expoConfig?.version} - 28.11.2025
						</Text>
					</View>
				</ScrollView>
			)}

			{!isLoggedIn && <LoginAndRegisterFormsWrapper onSuccess={fetchUserPage} />}
		</>
	);
}
