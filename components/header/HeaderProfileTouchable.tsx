import { lightMutedForeground } from "@/constants/Colors";
import { router } from "expo-router";
import { User } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import AppTouchableOpacity from "../AppTouchableOpacity";

const HeaderProfileTouchable = () => {
	return (
		<AppTouchableOpacity
			className="border border-border p-2.5 rounded-xl"
			onPress={() => router.push("/(tabs)/account")}
			hitSlop={10}
		>
			<User
				size={24}
				color={lightMutedForeground}
			/>
		</AppTouchableOpacity>
	);
};

export default HeaderProfileTouchable;
