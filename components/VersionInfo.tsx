import Constants from "expo-constants";
import { Linking, Text, View } from "react-native";
import AppTouchableOpacity from "./AppTouchableOpacity";

const PRIVACY_POLICY_URL = "https://atsepete.net/gizlilik-politikasi";

const VersionInfo = () => {
	return (
		<View className="mt-1 items-start gap-2">
			<AppTouchableOpacity
				onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
				hitSlop={10}
				accessibilityRole="link"
				accessibilityLabel="Gizlilik politikasını aç"
			>
				<Text
					style={{ color: "#3B82F6", textDecorationLine: "underline" }}
					className="text-xs font-semibold"
				>
					Gizlilik Politikası
				</Text>
			</AppTouchableOpacity>

			<Text className="text-xs text-muted-foreground">
				AtSepete @2025, v{Constants.expoConfig?.version} - 18.06.2026
			</Text>
		</View>
	);
};

export default VersionInfo;
