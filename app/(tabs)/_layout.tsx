import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Boxes, Grid3x3, Package, ShoppingBag, Sparkles, Store } from "lucide-react-native";

export default function TabLayout() {
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
					tabBarBackground: TabBarBackground,
					popToTopOnBlur: true,
					tabBarStyle: Platform.select({
						ios: {
							// Use a transparent background on iOS to show the blur effect
						},
						default: {}
					})
				}}
				backBehavior="history"
				initialRouteName="index"
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Fırsatlar",
						tabBarIcon: ({ color, focused }) => (
							<Sparkles
								size={28}
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
								size={28}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="pazaryerleri"
					options={{
						title: "Pazaryerleri",
						tabBarIcon: ({ color, focused }) => (
							<Store
								size={28}
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
					name="kategoriler"
					options={{
						title: "Kategoriler",
						tabBarIcon: ({ color, focused }) => (
							<Grid3x3
								size={28}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
				/>

				<Tabs.Screen
					name="indirimler/[slug]"
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
								size={28}
								strokeWidth={focused ? 1.6 : 1.5}
								color={color}
							/>
						)
					}}
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
