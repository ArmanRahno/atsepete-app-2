import Constants from "expo-constants";
import { Text } from "react-native";

const VersionInfo = () => {
	return (
		<Text className="mt-1 text-xs text-muted-foreground">
			AtSepete @2025, v{Constants.expoConfig?.version} - 23.12.2025
		</Text>
	);
};

export default VersionInfo;
