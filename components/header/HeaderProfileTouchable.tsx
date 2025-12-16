import { lightMutedForeground } from "@/constants/Colors";
import { router } from "expo-router";
import { User } from "lucide-react-native";
import React from "react";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const HeaderProfileTouchable = () => {
	const { isLoggedIn } = useAuthStatus();

	const iconColor =
		isLoggedIn === null ? lightMutedForeground : isLoggedIn ? "#22c55e" : "#ef4444";

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
