import React from "react";
import { Text, View } from "react-native";
import { BadgePercent } from "lucide-react-native";

export default function CheapestBadge() {
	return (
		<View className="absolute left-3 top-3 z-10 rounded-full bg-foreground px-3 py-1.5">
			<View className="flex-row items-center gap-1.5">
				<BadgePercent
					size={14}
					color="#7C3AED"
				/>
				<Text
					className="text-xs text-background"
					style={{ fontFamily: "Roboto_700Bold" }}
				>
					En Ucuz
				</Text>
			</View>
		</View>
	);
}
