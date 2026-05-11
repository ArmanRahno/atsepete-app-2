import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function useThemePalette() {
	const scheme = useColorScheme();

	return {
		scheme,
		isDark: scheme === "dark",
		colors: Colors[scheme]
	};
}
