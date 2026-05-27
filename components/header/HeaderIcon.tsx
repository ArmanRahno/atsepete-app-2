import { Pressable, Text, View } from "react-native";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";
import * as Linking from "expo-linking";
import { useThemePalette } from "@/hooks/useThemePalette";

const HeaderIcon = () => {
	const { colors, isDark } = useThemePalette();

	const handlePress = () => {
		Linking.openURL("https://atsepete.net/");
	};

	return (
		<Pressable
			onPress={handlePress}
			hitSlop={8}
			accessibilityRole="link"
			style={{
				alignSelf: "center",
				flexDirection: "row",
				alignItems: "center",
				gap: 8,
				flexShrink: 0,
				overflow: "visible"
			}}
		>
			<View className="rounded-full bg-primary/10 p-1">
				<View
					className="bg-primary justify-center items-center rounded-full"
					style={{ height: 22, width: 22 }}
				>
					<AtSepeteIcon
						height={14}
						width={14}
						fill="white"
						stroke="white"
						strokeWidth={4}
					/>
				</View>
			</View>

			<View
				style={{
					minWidth: 92,
					flexShrink: 0,
					overflow: "visible",
					paddingRight: 8,
					flexDirection: "row",
					alignItems: "baseline"
				}}
			>
				<Text
					allowFontScaling={false}
					style={{
						fontFamily: "Roboto_500Medium",
						fontSize: 18,
						lineHeight: 24,
						color: isDark ? "#FFFFFF" : colors.text,
						includeFontPadding: true,
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
						includeFontPadding: true
					}}
				>
					Sepete
				</Text>
			</View>
		</Pressable>
	);
};

export default HeaderIcon;
