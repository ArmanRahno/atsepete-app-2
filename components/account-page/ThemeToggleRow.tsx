import { useAppTheme } from "@/components/AppThemeProvider";
import { Moon, Sun } from "lucide-react-native";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export default function ThemeToggleRow() {
	const { colors, isDark, setScheme, toggleScheme } = useAppTheme();
	const Icon = isDark ? Moon : Sun;

	return (
		<TouchableOpacity
			onPress={toggleScheme}
			activeOpacity={0.85}
			className="w-full flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
		>
			<View className="flex-row flex-1 items-center gap-3 pr-3">
				<View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
					<Icon
						size={20}
						color={colors.primary}
					/>
				</View>

				<View className="flex-1">
					<Text className="text-foreground font-semibold">Koyu Tema</Text>
					<Text className="text-muted-foreground text-xs mt-1">
						{isDark ? "Koyu renk paleti aktif" : "Açık renk paleti aktif"}
					</Text>
				</View>
			</View>

			<Switch
				value={isDark}
				onValueChange={value => setScheme(value ? "dark" : "light")}
				trackColor={{ false: colors.border, true: colors.primary }}
				thumbColor={colors.primaryForeground}
				ios_backgroundColor={colors.border}
			/>
		</TouchableOpacity>
	);
}
