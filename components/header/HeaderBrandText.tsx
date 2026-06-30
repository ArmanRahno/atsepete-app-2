import { StyleSheet, Text, View } from "react-native";
import { useThemePalette } from "@/hooks/useThemePalette";

type Props = {
	fontSize?: number;
	lineHeight?: number;
};

const HeaderBrandText = ({ fontSize = 18, lineHeight = 24 }: Props) => {
	const { colors, isDark } = useThemePalette();
	const textStyle = {
		fontFamily: "Roboto_500Medium",
		fontSize,
		lineHeight,
		includeFontPadding: false
	} as const;

	return (
		<View style={[styles.container, { minWidth: fontSize * 4.6, height: lineHeight }]}>
			<Text
				allowFontScaling={false}
				style={[
					textStyle,
					styles.atText,
					{
						color: isDark ? "#FFFFFF" : colors.text
					}
				]}
			>
				At
			</Text>
			<Text
				allowFontScaling={false}
				style={[textStyle, { color: colors.primary }]}
			>
				Sepete
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		flexShrink: 0,
		overflow: "visible",
		paddingRight: 4
	},
	atText: {
		transform: [{ skewX: "-10deg" }]
	}
});

export default HeaderBrandText;
