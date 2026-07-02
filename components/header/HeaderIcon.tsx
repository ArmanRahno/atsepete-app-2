import { Pressable, StyleSheet, View } from "react-native";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";
import { useRouter } from "expo-router";
import HeaderBrandText from "./HeaderBrandText";

const HeaderIcon = () => {
	const router = useRouter();

	const handlePress = () => {
		router.navigate("/");
	};

	return (
		<Pressable
			onPress={handlePress}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel="Ana sayfaya git"
			style={styles.pressable}
		>
			<View className="rounded-full bg-primary/10 p-1">
				<View
					className="bg-primary justify-center items-center rounded-full"
					style={styles.iconCircle}
				>
					<AtSepeteIcon
						height={15}
						width={15}
						fill="white"
						stroke="white"
						strokeWidth={4}
					/>
				</View>
			</View>

			<HeaderBrandText />
		</Pressable>
	);
};

const styles = StyleSheet.create({
	pressable: {
		alignSelf: "center",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		flexShrink: 0,
		flexGrow: 0,
		overflow: "visible"
	},
	iconCircle: {
		height: 24,
		width: 24
	}
});

export default HeaderIcon;
