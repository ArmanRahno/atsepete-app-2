import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CheapestBadge() {
	return (
		<View
			className="drop-shadow"
			style={{
				position: "absolute",
				top: 12,
				left: -40,
				width: 120,
				transform: [{ rotate: "-45deg" }],
				zIndex: 1
			}}
		>
			<LinearGradient
				colors={["#ff8c00", "orangered"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
			>
				<Text className="text-xs text-white font-medium drop-shadow">En Ucuz!</Text>
			</LinearGradient>
		</View>
	);
}
