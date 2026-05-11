import { useAppTheme } from "@/components/AppThemeProvider";

export function useColorScheme() {
	return useAppTheme().scheme;
}
