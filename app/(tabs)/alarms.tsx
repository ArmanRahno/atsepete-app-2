import LoginAndRegisterFormsWrapper from "@/components/forms/LoginAndRegisterFormsWrapper";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Header from "@/components/header/Header";
import { Dropdown } from "react-native-element-dropdown";
import { router } from "expo-router";
import CategoriesList from "@/components/account-page/CategoriesList";
import MarketplacesList from "@/components/account-page/MarketplacesList";
import ItemsList from "@/components/account-page/ItemsList";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { ChevronRight } from "lucide-react-native";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import HeaderFirstRow from "@/components/header/HeaderFirstRow";
import { useThemePalette } from "@/hooks/useThemePalette";
import { SharedUserPageData, useAlarmSubscriptions } from "@/hooks/useAlarmSubscriptions";

export type AccountAPIResponse =
	| {
			status: "success" | "error";
			code: "LOGIN_REQUIRED" | string;
			items?: undefined;
			categories?: undefined;
			marketplaces?: undefined;
			referrer_code?: undefined;
			message?: undefined;
	  }
	| {
			status: "success" | "error";
			items: Item[];
			categories: string[];
			marketplaces: string[];
			referrer_code?: string;
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
			referrer_code?: undefined;
	  };

type Mode = "ITEMS" | "CATEGORIES" | "MARKETPLACES";

export default function AlarmScreen() {
	const { colors } = useThemePalette();
	const {
		userPage,
		isLoggedIn,
		loading,
		removeItemSubscription,
		setCategorySubscribed,
		setMarketplaceSubscribed,
		refreshUserPage
	} = useAlarmSubscriptions();
	const [mode, setMode] = useState<Mode>("ITEMS");
	const userData: SharedUserPageData | null = userPage;

	const dropDownData = [
		{ label: "Ürünler", value: "ITEMS" },
		{ label: "Pazaryerleri", value: "MARKETPLACES" },
		{ label: "Kategoriler", value: "CATEGORIES" }
	];

	const themedStyles = useMemo(
		() =>
			StyleSheet.create({
				dropdown: {
					backgroundColor: colors.background,
					paddingHorizontal: 16,
					paddingVertical: 8,
					borderRadius: 8,
					borderWidth: 1,
					borderColor: colors.border
				},
				dropdownContainer: {
					borderRadius: 8,
					overflow: "hidden",
					backgroundColor: colors.popover
				},
				dropdownText: { color: colors.popoverText },
				selectedText: { color: colors.text, fontWeight: "600", fontSize: 16 }
			}),
		[colors]
	);

	if (loading) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Header className="shadow-none">
				<HeaderFirstRow />
				<HeaderSecondRow />
			</Header>

			{isLoggedIn && (
				<View className="p-2.5 bg-background shadow-lg gap-2 border-b border-border">
					<Dropdown
						style={themedStyles.dropdown}
						containerStyle={themedStyles.dropdownContainer}
						itemTextStyle={themedStyles.dropdownText}
						selectedTextStyle={themedStyles.selectedText}
						activeColor={colors.secondary}
						iconColor={colors.mutedForeground}
						data={dropDownData}
						labelField="label"
						valueField="value"
						value={mode}
						onChange={item => setMode(item.value)}
					/>

					<AppTouchableOpacity
						onPress={() => router.push("/(modals)/notification-settings")}
						style={themedStyles.dropdown}
						className="w-full flex-row items-center justify-between"
					>
						<View className="flex-1 pr-3">
							<Text
								style={themedStyles.selectedText}
								className="font-semibold"
							>
								Bildirim Ayarları
							</Text>
						</View>
						<ChevronRight
							size={16}
							strokeWidth={2.6}
							color={colors.mutedForeground}
						/>
					</AppTouchableOpacity>
				</View>
			)}

			{isLoggedIn &&
				mode === "ITEMS" &&
				userData &&
				"items" in userData &&
				userData.items && (
					<ItemsList
						items={userData.items}
						onListenerSuccess={(itemId, finalState) => {
							if (!finalState) removeItemSubscription(itemId);
						}}
					/>
				)}

			{isLoggedIn &&
				mode === "MARKETPLACES" &&
				userData &&
				"marketplaces" in userData &&
				userData.marketplaces && (
					<MarketplacesList
						onRemoveMarketplace={item => {
							setMarketplaceSubscribed(item, false);
						}}
						marketplaces={userData.marketplaces}
					/>
				)}

			{isLoggedIn &&
				mode === "CATEGORIES" &&
				userData &&
				"categories" in userData &&
				userData.categories && (
					<CategoriesList
						categories={userData.categories}
						onRemoveCategory={item => {
							setCategorySubscribed(item, false);
						}}
					/>
				)}

			{!isLoggedIn && <LoginAndRegisterFormsWrapper onSuccess={refreshUserPage} />}
		</>
	);
}
