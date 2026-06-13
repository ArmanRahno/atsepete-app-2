import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { useThemePalette } from "@/hooks/useThemePalette";
import { Search, X } from "lucide-react-native";
import { Platform, TextInput, View } from "react-native";

type IslandSearchInputProps = {
	placeholder: string;
	value: string;
	onChangeText: (value: string) => void;
};

export default function IslandSearchInput({
	placeholder,
	value,
	onChangeText
}: IslandSearchInputProps) {
	const { colors, isDark } = useThemePalette();
	const shellBackground = isDark ? "#1E1914" : "#FFFDF7";
	const clearBackground = isDark ? "#2A241E" : "#F1E8DD";

	return (
		<View className="relative px-4 pb-3 pt-3">
			<View
				className="h-[52px] flex-row items-center rounded-full px-5"
				style={{
					backgroundColor: shellBackground,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 6 },
					shadowOpacity: isDark ? 0.28 : 0.1,
					shadowRadius: 12,
					elevation: 3
				}}
			>
				<Search
					size={20}
					color={colors.mutedForeground}
					strokeWidth={1.9}
				/>
				<TextInput
					className="ml-3 h-full flex-1 p-0 text-base text-foreground"
					style={
						Platform.OS === "ios"
							? { lineHeight: 20, paddingTop: 0, paddingBottom: 0 }
							: { textAlignVertical: "center" }
					}
					placeholder={placeholder}
					placeholderTextColor={colors.mutedForeground}
					autoCapitalize="none"
					autoCorrect={false}
					value={value}
					onChangeText={onChangeText}
				/>
				{value ? (
					<AppTouchableOpacity
						className="ml-2 h-8 w-8 items-center justify-center rounded-full"
						style={{ backgroundColor: clearBackground }}
						accessibilityRole="button"
						accessibilityLabel="Aramayı temizle"
						onPress={() => onChangeText("")}
					>
						<X
							size={17}
							color={colors.mutedForeground}
							strokeWidth={2.4}
						/>
					</AppTouchableOpacity>
				) : null}
			</View>
		</View>
	);
}
