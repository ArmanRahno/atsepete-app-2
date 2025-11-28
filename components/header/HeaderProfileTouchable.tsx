import { lightMutedForeground } from "@/constants/Colors";
import { router } from "expo-router";
import { User } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

const HeaderProfileTouchable = () => {
	return (
		<TouchableOpacity
			className="border border-border p-2 rounded-xl"
			onPress={() => router.push("/(tabs)/account")}
		>
			<User
				size={20}
				color={lightMutedForeground}
			/>
		</TouchableOpacity>
	);
};

export default HeaderProfileTouchable;
