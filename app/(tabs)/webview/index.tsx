import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";

export default function WebviewScreen() {
	const { url } = useLocalSearchParams<{ url?: string }>();

	if (!url || typeof url !== "string") {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Geçersiz URL</Text>
			</View>
		);
	}

	return <WebView source={{ uri: url }} />;
}
