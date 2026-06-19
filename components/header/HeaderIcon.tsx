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

			<Text
				allowFontScaling={false}
				numberOfLines={1}
				style={{
					minWidth: 82,
					paddingRight: 4,
					flexShrink: 0,
					overflow: "visible",
					fontFamily: "Roboto_500Medium",
					fontSize: 18,
					lineHeight: 24,
					color: colors.primary,
					includeFontPadding: false
				}}
			>
				<Text
					style={{
						color: isDark ? "#FFFFFF" : colors.text,
						fontStyle: "italic"
					}}
				>
					At
				</Text>
				Sepete
			</Text>
		</Pressable>
	);
};

export default HeaderIcon;
