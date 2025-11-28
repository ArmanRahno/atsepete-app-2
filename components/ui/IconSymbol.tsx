// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
	"house": "home",
	"house.fill": "home",
	"person": "person",
	"person.fill": "person",
	"bell": "notifications",
	"bell.fill": "notifications",
	"storefront": "store",
	"storefront.fill": "store",
	"square.grid.2x2": "apps",
	"square.grid.2x2.fill": "apps",
	"magnifyingglass.circle": "search",
	"magnifyingglass.circle.fill": "search",
	"desktopcomputer": "computer",
	"tshirt": "checkroom",
	"sparkles": "auto-awesome",
	"phone.fill": "phone-android",
	"clock": "watch-later",
	"book": "menu-book",
	"puzzlepiece": "extension",
	"figure.run": "directions-run",
	"car": "directions-car",
	"figure.and.child.holdinghands": "family-restroom",
	"sofa": "weekend",
	"briefcase": "business-center",
	"music.note": "music-note",
	"film": "movie",
	"gamecontroller": "sports-esports",
	"heart.text.square": "health-and-safety",
	"hammer": "construction",
	"figure.walk": "directions-walk",
	"tag": "local-offer",
	"pawprint": "pets",
	"fork.knife": "restaurant",
	"hanger": "checkroom",
	"hands.sparkles": "soap",
	"iphone": "phone-iphone",
	"baby.bottle": "child-friendly",
	"bicycle": "pedal-bike",
	"tag.fill": "local-offer",
	"leaf": "eco",
	"shower.head": "cleaning-services",
	"gift.fill": "card-giftcard",
	"cpu": "memory",
	"tshirt.fill": "checkroom",
	"pawprint.fill": "pets",
	"lightbulb": "lightbulb",
	"figure.dress": "checkroom",
	"face.smiling": "face-retouching-natural",
	"cart": "shopping-cart",
	"clock.fill": "watch-later",
	"house.badge.shield": "security",
	"car.fill": "directions-car-filled",
	"fan.desk.fill": "kitchen",
	"figure.2.and.child.holdinghands": "family-restroom",
	"tag.circle": "local-offer",
	"car.badge.plus": "car-repair",
	"briefcase.fill": "business-center",
	"paintbrush.pointed": "format-paint",
	"scooter": "two-wheeler"
} as Partial<
	Record<
		import("expo-symbols").SymbolViewProps["name"],
		React.ComponentProps<typeof MaterialIcons>["name"]
	>
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
	name,
	size = 24,
	color,
	style
}: {
	name: IconSymbolName;
	size?: number;
	color: string | OpaqueColorValue;
	style?: StyleProp<ViewStyle>;
	weight?: SymbolWeight;
}) {
	return (
		<MaterialIcons
			color={color}
			size={size}
			name={MAPPING[name]}
			// @ts-ignore
			style={style}
		/>
	);
}
