import { Pressable, Text, View } from "react-native";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";
import { useRouter } from "expo-router";
import { useThemePalette } from "@/hooks/useThemePalette";

const HeaderIcon = () => {
	const { colors, isDark } = useThemePalette();
	const router = useRouter();

	const handlePress = () => {
		router.replace("/");
	};

	return (
		<Pressable
			onPress={handlePress}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel="Ana sayfaya git"
			style={{
				alignSelf: "center",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
				flexShrink: 0,
				overflow: "visible"
			}}
		>
			<View className="rounded-full bg-primary/10 p-1">
				<View
					className="bg-primary justify-center items-center rounded-full"
					style={{ height: 24, width: 24 }}
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

			<View
				style={{
					flexShrink: 0,
					overflow: "visible",
					flexDirection: "row",
					alignItems: "center"
				}}
			>
				<Text
					allowFontScaling={false}
					style={{
						fontFamily: "Roboto_500Medium",
						fontSize: 18,
						lineHeight: 24,
						color: isDark ? "#FFFFFF" : colors.text,
						includeFontPadding: false,
						fontStyle: "italic"
					}}
				>
					At
				</Text>
				<Text
					allowFontScaling={false}
					style={{
						fontFamily: "Roboto_500Medium",
						fontSize: 18,
						lineHeight: 24,
						color: colors.primary,
						includeFontPadding: false
					}}
				>
					Sepete
				</Text>
			</View>
		</Pressable>
	);
};

export default HeaderIcon;
