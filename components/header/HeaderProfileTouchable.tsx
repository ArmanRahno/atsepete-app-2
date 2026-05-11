import { router } from "expo-router";
import { User } from "lucide-react-native";
import React from "react";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useThemePalette } from "@/hooks/useThemePalette";

const HeaderProfileTouchable = () => {
	const { isLoggedIn } = useAuthStatus();
	const { colors } = useThemePalette();

	const iconColor =
		isLoggedIn === null ? colors.mutedForeground : isLoggedIn ? "#22c55e" : colors.destructive;

	return (
		<AppTouchableOpacity
			className="border border-border p-2.5 rounded-xl"
			onPress={() => router.push("/(tabs)/account")}
			hitSlop={10}
		>
			<User
				size={24}
				color={iconColor}
			/>
		</AppTouchableOpacity>
	);
};

export default HeaderProfileTouchable;
