import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import LoadingIndicator from "@/components/LoadingIndicator";
import DetailedItemCard from "@/components/item/DetailedItemCard";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";

export default function ItemDetailScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const [item, setItem] = useState<Item | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) return;

		async function fetchItem() {
			try {
				setLoading(true);
				const response = await fetch(
					`https://atsepete.net/api/application/page/item/${slug}`
				);

				if (!response.ok) {
					throw new Error("Item not found or server error");
				}

				const data = await response.json();
				setItem(data);
			} catch (err: any) {
				console.error(err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchItem();
	}, [slug]);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center" }}>
				<LoadingIndicator />
			</View>
		);
	}

	if (error) {
		return (
			<View style={{ flex: 1, padding: 16 }}>
				<Text style={{ color: "red", fontWeight: "bold" }}>Error: {error}</Text>
			</View>
		);
	}

	if (!item) {
		return (
			<View style={{ flex: 1, padding: 16 }}>
				<Text style={{ color: "red", fontWeight: "bold" }}>Ürün bulunamadı.</Text>
			</View>
		);
	}

	return (
		<ScrollView className="p-2">
			<View className="p-3 pb-10 bg-background">
				<DetailedItemCard item={item} />

				<View className="flex-row flex-wrap items-center mt-4">
					<Text
						style={{ fontFamily: "Roboto_400Regular" }}
						className="text-sm text-muted-foreground"
						textBreakStrategy="simple"
					>
						Bir hata ile mi karşılaştınız?
					</Text>

					<AppTouchableOpacity
						onPress={() => router.push("/(modals)/report-issue")}
						hitSlop={12}
					>
						<Text className="px-3 py-1 text-sm text-foreground font-medium underline">
							Hata Bildir
						</Text>
					</AppTouchableOpacity>

					<AppTouchableOpacity
						onPress={() => router.push("/(modals)/make-suggestion")}
						hitSlop={12}
					>
						<Text className="px-3 pl-1 py-1 text-sm text-foreground font-medium underline">
							Öneri Yap
						</Text>
					</AppTouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}
