import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import LoadingIndicator from "@/components/LoadingIndicator";
import DetailedItemCard from "@/components/item/DetailedItemCard";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CheapestBadge from "@/components/item/CheapestBadge";
import { BlurView } from "expo-blur";
import Animated, {
	Extrapolation,
	SharedValue,
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from "react-native-reanimated";

function HeroSquare({ item, scrollY }: { item: Item; scrollY: SharedValue<number> }) {
	const { width } = useWindowDimensions();
	const size = width;

	const squareAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(
					scrollY.value,
					[-size, 0, size * 2.2],
					[-size * 0.12, 0, size * 0.76],
					Extrapolation.CLAMP
				)
			},
			{
				scale: interpolate(
					scrollY.value,
					[-size, 0, size * 2.2],
					[1.1, 1, 0.88],
					Extrapolation.CLAMP
				)
			}
		],
		opacity: interpolate(
			scrollY.value,
			[0, size * 0.9, size * 2.1],
			[1, 0.95, 0.78],
			Extrapolation.CLAMP
		)
	}));

	const blurOverlayStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollY.value,
			[0, size * 0.3, size * 1.5],
			[0, 0.14, 0.78],
			Extrapolation.CLAMP
		)
	}));

	const dimOverlayStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollY.value,
			[0, size * 0.25, size * 1.5],
			[0, 0.04, 0.14],
			Extrapolation.CLAMP
		)
	}));

	return (
		<View
			className="overflow-hidden bg-white"
			style={{ height: size }}
		>
			<Animated.View style={[StyleSheet.absoluteFillObject, squareAnimatedStyle]}>
				<View className="flex-1 bg-white">
					<View className="flex-1 items-center justify-center bg-white p-6 pb-12">
						<Image
							source={{ uri: item.image_link }}
							resizeMode="contain"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>

					<Animated.View
						pointerEvents="none"
						style={[StyleSheet.absoluteFillObject, blurOverlayStyle]}
					>
						<BlurView
							intensity={48}
							tint="light"
							style={StyleSheet.absoluteFillObject}
						/>
					</Animated.View>

					<Animated.View
						pointerEvents="none"
						style={[
							StyleSheet.absoluteFillObject,
							{ backgroundColor: "#ffffff" },
							dimOverlayStyle
						]}
					/>
				</View>
			</Animated.View>

			{item.is_cheapest && <CheapestBadge />}
		</View>
	);
}

export default function ItemDetailScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const [item, setItem] = useState<Item | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const insets = useSafeAreaInsets();
	const scrollY = useSharedValue(0);

	const onScroll = useAnimatedScrollHandler(event => {
		scrollY.value = event.contentOffset.y;
	});

	useEffect(() => {
		if (!slug) return;

		async function fetchItem() {
			try {
				setLoading(true);
				const response = await fetch(
					`https://atsepete.net/api/application/page/urunler-all-item/${slug}`
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
			<View className="flex-1 justify-center bg-secondary">
				<LoadingIndicator />
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 bg-secondary p-4">
				<Text style={styles.errorText}>Error: {error}</Text>
			</View>
		);
	}

	if (!item) {
		return (
			<View className="flex-1 bg-secondary p-4">
				<Text style={styles.errorText}>Ürün bulunamadı.</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-secondary">
			<Animated.ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 4) }}
			>
				<HeroSquare
					item={item}
					scrollY={scrollY}
				/>

				<View className="-mt-6 rounded-t-[28px] bg-secondary px-3 pt-4 pb-2">
					<DetailedItemCard item={item} />

					<View className="mt-4 flex-row flex-wrap items-center">
						<Text
							style={styles.footerMuted}
							className="text-sm text-muted-foreground"
						>
							Bir hata ile mi karşılaştınız?
						</Text>

						<AppTouchableOpacity
							onPress={() => router.push("/(modals)/report-issue")}
							hitSlop={12}
						>
							<Text style={styles.footerLink}>Hata Bildir</Text>
						</AppTouchableOpacity>

						<AppTouchableOpacity
							onPress={() => router.push("/(modals)/make-suggestion")}
							hitSlop={12}
						>
							<Text style={[styles.footerLink, { paddingLeft: 4 }]}>Öneri Yap</Text>
						</AppTouchableOpacity>
					</View>
				</View>
			</Animated.ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	errorText: {
		color: "red",
		fontWeight: "700",
		fontFamily: "Roboto_700Bold"
	},
	footerMuted: {
		fontFamily: "Roboto_400Regular"
	},
	footerLink: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		fontSize: 14,
		textDecorationLine: "underline",
		fontFamily: "Roboto_500Medium"
	}
});
