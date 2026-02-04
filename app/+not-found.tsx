import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Sayfa Bulunamadı" }} />
			<ThemedView style={styles.container}>
				<ThemedText type="title">Aradığınız sayfa bulunamadı.</ThemedText>
				<ThemedText style={styles.subtitle}>
					Sayfa kaldırılmış, taşınmış olabilir veya bağlantı hatalı olabilir.
				</ThemedText>

				<Link
					href="/"
					style={styles.link}
				>
					<ThemedText type="link">Ana sayfaya dön</ThemedText>
				</Link>
			</ThemedView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20
	},
	subtitle: {
		marginTop: 10,
		textAlign: "center",
		opacity: 0.8,
		lineHeight: 20
	},
	link: {
		marginTop: 18,
		paddingVertical: 14
	}
});
