import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View } from "react-native";

type ProgressiveBlurProps = {
	isDark: boolean;
	height?: number;
};

export default function ProgressiveBlur({ isDark, height = 110 }: ProgressiveBlurProps) {
	const maskColors: [string, string, string, string] = [
		"rgba(0,0,0,1)",
		"rgba(0,0,0,0.85)",
		"rgba(0,0,0,0.35)",
		"rgba(0,0,0,0)"
	];
	const overlayColors: [string, string, string] = isDark
		? ["rgba(12,10,8,0.78)", "rgba(12,10,8,0.42)", "rgba(12,10,8,0)"]
		: ["rgba(255,253,247,0.72)", "rgba(255,253,247,0.36)", "rgba(255,253,247,0)"];

	return (
		<View
			pointerEvents="none"
			style={[
				styles.container,
				{
					height
				}
			]}
		>
			<MaskedView
				style={StyleSheet.absoluteFill}
				maskElement={
					<LinearGradient
						colors={maskColors}
						locations={[0, 0.35, 0.72, 1]}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
						style={StyleSheet.absoluteFill}
					/>
				}
			>
				<BlurView
					intensity={isDark ? 55 : 45}
					tint={isDark ? "systemMaterialDark" : "systemMaterialLight"}
					experimentalBlurMethod={
						Platform.OS === "android" ? "dimezisBlurView" : undefined
					}
					style={StyleSheet.absoluteFill}
				/>
			</MaskedView>

			<LinearGradient
				colors={overlayColors}
				locations={[0, 0.55, 1]}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		overflow: "hidden"
	}
});
