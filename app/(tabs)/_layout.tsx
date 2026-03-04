import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors, lightBackground } from "@/constants/Colors";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Boxes, Grid3x3, Package, ShoppingBag, Sparkles, Store } from "lucide-react-native";
import { View } from "react-native";

export default function TabLayout() {
	const insets = useSafeAreaInsets();

	return (
		<SafeAreaView
			edges={["top"]}
			className="flex-1 bg-background"
		>
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: Colors["light"].tint,
					headerShown: false,
					tabBarButton: HapticTab,
					tabBarBackground: () =>
						Platform.OS === "ios" ? (
							<View style={{ flex: 1, backgroundColor: lightBackground }} />
						) : (
							TabBarBackground
						),
					popToTopOnBlur: true,
					tabBarStyle: Platform.select({
						ios: {
							height: 66 + insets.bottom,
							paddingBottom: insets.bottom,
							paddingTop: 6
						},
						default: {
							height: 66 + insets.bottom,
							paddingBottom: insets.bottom,
							paddingTop: 6
						}
					}),
					tabBarLabelStyle: {
						fontSize: 11,
						marginTop: 4
					}
				}}
				backBehavior="history"
				initialRouteName="(home)"
			>
				<Tabs.Screen
					name="(home)"
					options={{
						title: "Fırsatlar",
						tabBarIcon: ({ color, focused }) => (
							<Sparkles
								size={32}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="urunler"
					options={{
						title: "Tüm Ürünler",
						tabBarIcon: ({ color, focused }) => (
							<Boxes
								size={32}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="(pazaryerleri)"
					options={{
						title: "Pazaryerleri",
						tabBarIcon: ({ color, focused }) => (
							<Store
								size={32}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="(kategoriler)"
					options={{
						title: "Kategoriler",
						tabBarIcon: ({ color, focused }) => (
							<Grid3x3
								size={32}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="ara"
					listeners={{}}
					options={{
						href: null
					}}
				/>

				<Tabs.Screen
					name="alarms"
					options={{
						title: "Takip Listem",
						tabBarIcon: ({ color, focused }) => (
							<Bell
								size={32}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="account-forgot-password"
					options={{ href: null }}
				/>

				<Tabs.Screen
					name="account-change-password"
					options={{ href: null }}
				/>

				<Tabs.Screen
					name="account"
					options={{ href: null }}
				/>

				<Tabs.Screen
					name="barkod"
					options={{ href: null }}
				/>

				<Tabs.Screen
					name="webview"
					options={{ href: null }}
				/>
			</Tabs>
		</SafeAreaView>
	);
}
