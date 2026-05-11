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
			className="self-center flex-row items-center gap-2"
			onPress={handlePress}
			hitSlop={8}
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
				className="flex-row items-baseline"
				style={{ minWidth: 80 }}
			>
				<Text
					className="text-lg italic"
					style={{
						fontFamily: "Roboto_700Bold",
						includeFontPadding: false,
						lineHeight: 24,
						color: isDark ? "#FFFFFF" : colors.text
					}}
				>
					At
				</Text>
				<Text
					className="text-lg text-primary"
					style={{
						fontFamily: "Roboto_700Bold",
						includeFontPadding: false,
						lineHeight: 24,
						paddingRight: 3
					}}
				>
					Sepete
				</Text>
			</View>
		</Pressable>
	);
};

export default HeaderIcon;
