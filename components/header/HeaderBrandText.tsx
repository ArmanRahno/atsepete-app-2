import { StyleSheet, Text, View } from "react-native";
import { useThemePalette } from "@/hooks/useThemePalette";

type Props = {
	fontSize?: number;
	lineHeight?: number;
};

const HeaderBrandText = ({ fontSize = 18, lineHeight = 24 }: Props) => {
	const { colors, isDark } = useThemePalette();

	const baseStyle = {
		fontSize,
		lineHeight
	};

	return (
		<View
			style={[
				styles.container,
				{
					minHeight: lineHeight
				}
			]}
		>
			<Text
				allowFontScaling={false}
				style={[
					styles.brandText,
					baseStyle,
					{
						color: isDark ? "#FFFFFF" : colors.text
					}
				]}
			>
				At
			</Text>

			<Text
				allowFontScaling={false}
				style={[
					styles.brandText,
					baseStyle,
					{
						color: colors.primary
					}
				]}
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
		flexGrow: 0,
		paddingRight: 4,
		overflow: "visible"
	},
	brandText: {
		fontFamily: "Roboto_500Medium",
		includeFontPadding: true
	}
});

export default HeaderBrandText;
