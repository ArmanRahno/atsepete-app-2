import Constants from "expo-constants";
import { Text } from "react-native";

const VersionInfo = () => {
	return (
		<Text className="mt-1 text-xs text-muted-foreground">
			AtSepete @2025, v{Constants.expoConfig?.version} - 11.02.2026
		</Text>
	);
};

export default VersionInfo;
