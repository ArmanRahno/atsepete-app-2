import React, { useCallback, useRef } from "react";
import {
	Animated,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	Text,
	ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Undo2 } from "lucide-react-native";
import { lightBorder, lightPrimary, lightSecondary } from "@/constants/Colors";
import AppTouchableOpacity from "./AppTouchableOpacity";

const ACCENT_COLOR = "#007AFF";

export const BOTTOM_BACK_BAR_HEIGHT = 56;

export const BOTTOM_BACK_BAR_EXTRA_GAP = Platform.OS === "android" ? 18 : 12;

export const BOTTOM_BACK_BAR_TOTAL_HEIGHT = BOTTOM_BACK_BAR_HEIGHT + BOTTOM_BACK_BAR_EXTRA_GAP + 24;

export type BottomBackBarOnScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => void;

const opacityBus = {
	value: new Animated.Value(1)
};

export function useBottomBackBarOnScroll(opts?: {
	minOpacity?: number;
	animationMs?: number;
	enabled?: boolean;
}): BottomBackBarOnScroll {
	const minOpacity = opts?.minOpacity ?? 0.55;
	const animationMs = opts?.animationMs ?? 260;
	const enabled = opts?.enabled ?? true;

	const lastYRef = useRef(0);
	const lastDirRef = useRef<"up" | "down" | "none">("none");
	const rafLockRef = useRef(false);

	const animateTo = useCallback(
		(to: number) => {
			Animated.timing(opacityBus.value, {
				toValue: to,
				duration: animationMs,
				useNativeDriver: true
			}).start();
		},
		[animationMs]
	);

	return useCallback(
		e => {
			if (!enabled) return;

			// IMPORTANT: React Native may pool the event.
			// Grab what we need synchronously.
			const ne = e?.nativeEvent;
			if (!ne) return;

			const y = ne.contentOffset?.y ?? 0;
			const contentH = ne.contentSize?.height ?? 0;
			const viewH = ne.layoutMeasurement?.height ?? 0;

			// Throttle with RAF.
			if (rafLockRef.current) return;
			rafLockRef.current = true;

			requestAnimationFrame(() => {
				rafLockRef.current = false;

				const isAtTop = y <= 0;
				const isAtBottom = y + viewH >= contentH - 8;

				// Always fully visible at top & bottom
				if (isAtTop || isAtBottom) {
					lastDirRef.current = "none";
					animateTo(1);
					lastYRef.current = y;
					return;
				}

				const dy = y - lastYRef.current;

				// Ignore tiny jitters
				if (Math.abs(dy) < 2) return;

				if (dy > 0) {
					// scrolling down => fade
					if (lastDirRef.current !== "down") {
						lastDirRef.current = "down";
						animateTo(minOpacity);
					}
				} else {
					// scrolling up => show
					if (lastDirRef.current !== "up") {
						lastDirRef.current = "up";
						animateTo(1);
					}
				}

				lastYRef.current = y;
			});
		},
		[animateTo, enabled, minOpacity]
	);
}

export default function BottomBackBar() {
	const insets = useSafeAreaInsets();

	const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 16 : 10);

	const containerStyle: Animated.WithAnimatedObject<ViewStyle> = {
		position: "absolute",
		left: 0,
		right: 0,

		// Lift slightly above bottom edge on Android to avoid padding issues
		bottom: Platform.OS === "android" ? 12 : 0,

		paddingBottom: bottomPad,
		paddingHorizontal: 16,
		opacity: opacityBus.value
	};

	return (
		<Animated.View
			pointerEvents="box-none"
			style={containerStyle}
		>
			<AppTouchableOpacity
				onPress={() => router.back()}
				style={{
					height: BOTTOM_BACK_BAR_HEIGHT,
					borderRadius: BOTTOM_BACK_BAR_HEIGHT / 2,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: lightSecondary,
					flexDirection: "row",
					gap: 6,
					borderWidth: 1,
					borderColor: lightBorder
				}}
			>
				<Text style={{ color: ACCENT_COLOR, fontSize: 16, fontWeight: "600" }}>
					Geri Dön
				</Text>
				<Undo2
					color={ACCENT_COLOR}
					size={22}
				/>
			</AppTouchableOpacity>
		</Animated.View>
	);
}
