import LoginAndRegisterFormsWrapper from "@/components/forms/LoginAndRegisterFormsWrapper";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, View } from "react-native";
import Header from "@/components/header/Header";
import { Dropdown } from "react-native-element-dropdown";
import {
	lightBackground,
	lightBorder,
	lightDestructive,
	lightForeground
} from "@/constants/Colors";
import { useFocusEffect } from "expo-router";
import addMarketplaceListener from "@/lib/addMarketplaceListener";
import addCategoryListener from "@/lib/addCategoryListener";
import CategoriesList from "@/components/account-page/CategoriesList";
import MarketplacesList from "@/components/account-page/MarketplacesList";
import ItemsList from "@/components/account-page/ItemsList";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { Payment } from "@/zod-schemas/save-user-payment-data";

type EarningsPreviousPaymentsHistory = {
	datetime: string;
	payment_method: string;
	payment_amount: number;
};

type EarningsHistory = {
	datetime: string;
	earning_action_type: string;
	earning_amount: number;
};

export type Earnings = {
	_id: string;
	_id_user_account: string;
	datetime_first_action: string;
	datetime_last_action: string;
	earnings_total: number;
	earnings_paid_total: number;
	earnings_unpaid_total: number;
	earnings_previous_payments_history: EarningsPreviousPaymentsHistory[];
	earnings_history: EarningsHistory[];
};

export type AccountAPIResponse =
	| {
			status: "success" | "error";
			code: "LOGIN_REQUIRED" | string;
			items?: undefined;
			categories?: undefined;
			marketplaces?: undefined;
			coins?: undefined;
			referrer_code?: undefined;
			earnings?: undefined;
			payment_data?: Payment;
			message?: undefined;
	  }
	| {
			status: "success" | "error";
			items: Item[];
			categories: string[];
			marketplaces: string[];
			coins: number;
			referrer_code: string;
			earnings: Earnings;
			payment_data: Payment;
			code?: undefined;
			message?: undefined;
	  }
	| {
			status: "success" | "error";
			message: string;
			code?: undefined;
			items?: undefined;
			categories?: undefined;
			marketplaces?: undefined;
			coins?: undefined;
			referrer_code?: undefined;
			earnings?: undefined;
			payment_data?: Payment;
	  };

type Mode = "ITEMS" | "CATEGORIES" | "MARKETPLACES";

export default function AlarmScreen() {
	const [userData, setUserData] = useState<AccountAPIResponse | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [mode, setMode] = useState<Mode>("ITEMS");

	const dropDownData = [
		{ label: "Ürünler", value: "ITEMS" },
		{ label: "Pazaryerleri", value: "MARKETPLACES" },
		{ label: "Kategoriler", value: "CATEGORIES" }
	];

	const fetchUserPage = useCallback(async () => {
		try {
			setLoading(true);
			setIsLoggedIn(false);
			setUserData(null);

			const curSession = await AsyncStorage.getItem("user-session-token");
			if (!curSession) return;

			const response = await fetch(
				"https://atsepete.net/api/application/page/user-page?earnings=false"
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

			if ("items" in data && data.items) {
				setUserData({
					...data,
					items: data.items.map(item => ({ ...item, is_user_subscribed: true }))
				});
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

	if (loading) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Header className="shadow-none">
				<HeaderIcon />
				<HeaderSecondRow />
			</Header>

			{isLoggedIn && (
				<View className="p-2.5 bg-background shadow-lg">
					<Dropdown
						style={styles.dropdown}
						containerStyle={styles.dropdownContainer}
						itemTextStyle={styles.dropdownText}
						selectedTextStyle={styles.selectedText}
						data={dropDownData}
						labelField="label"
						valueField="value"
						value={mode}
						onChange={item => setMode(item.value)}
					/>
				</View>
			)}

			{isLoggedIn && mode === "ITEMS" && userData && userData.items && (
				<ItemsList
					items={userData.items}
					onListenerSuccess={itemId => {
						setUserData(prevState => {
							if (!prevState || !prevState.items) {
								return prevState;
							}
							return {
								...prevState,
								items: prevState.items.filter(item => item._id !== itemId)
							};
						});
					}}
				/>
			)}

			{isLoggedIn && mode === "MARKETPLACES" && userData && userData.marketplaces && (
				<MarketplacesList
					onRemoveMarketplace={async item => {
						setUserData(prevState => {
							if (!prevState || !prevState.marketplaces) {
								return prevState;
							}

							return {
								...prevState,
								marketplaces: prevState.marketplaces.filter(
									marketplace => marketplace !== item
								)
							};
						});

						await addMarketplaceListener({
							marketplace: item,
							isUserSubscribed: true
						});
					}}
					marketplaces={userData.marketplaces}
				/>
			)}

			{isLoggedIn && mode === "CATEGORIES" && userData && userData.categories && (
				<CategoriesList
					categories={userData.categories}
					onRemoveCategory={async item => {
						await addCategoryListener({
							category: item,
							isUserSubscribed: true
						});

						setUserData(prevState => {
							if (!prevState || !prevState.categories) {
								return prevState;
							}

							return {
								...prevState,
								categories: prevState.categories.filter(
									category => category !== item
								)
							};
						});
					}}
				/>
			)}

			{!isLoggedIn && <LoginAndRegisterFormsWrapper onSuccess={fetchUserPage} />}
		</>
	);
}

const styles = StyleSheet.create({
	dropdown: {
		backgroundColor: lightBackground,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: lightBorder
	},
	dropdownContainer: { borderRadius: 8, overflow: "hidden" },
	dropdownText: { color: lightForeground },
	selectedText: { fontWeight: "600" },
	summaryText: {
		fontSize: 16,
		fontWeight: "600",
		color: lightForeground
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: lightBackground,
		padding: 8,
		borderBottomWidth: 1,
		borderColor: lightBorder
	},
	tableHeaderCell: {
		fontWeight: "bold",
		color: lightForeground,
		textAlign: "center"
	},
	tableRow: {
		flexDirection: "row",
		padding: 8,
		borderBottomWidth: 1,
		borderColor: lightBorder
	},
	tableCell: {
		textAlign: "center"
	},
	emptyListText: { fontWeight: "600", color: lightDestructive }
});
