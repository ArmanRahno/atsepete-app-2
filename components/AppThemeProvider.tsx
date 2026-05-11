import AsyncStorage from "@react-native-async-storage/async-storage";
import { vars } from "nativewind";
import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from "react";
import { View } from "react-native";
import { APP_THEME_STORAGE_KEY, AppColorScheme, Colors, ThemeHsl } from "@/constants/Colors";

type AppThemeContextValue = {
	scheme: AppColorScheme;
	isDark: boolean;
	colors: (typeof Colors)[AppColorScheme];
	setScheme: (scheme: AppColorScheme) => Promise<void>;
	toggleScheme: () => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function normalizeScheme(value: string | null | undefined): AppColorScheme | null {
	return value === "dark" || value === "light" ? value : null;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
	const [scheme, setSchemeState] = useState<AppColorScheme>("light");

	useEffect(() => {
		let cancelled = false;

		AsyncStorage.getItem(APP_THEME_STORAGE_KEY).then(savedScheme => {
			if (cancelled) return;
			setSchemeState(normalizeScheme(savedScheme) ?? "light");
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const setScheme = useCallback(
		async (nextScheme: AppColorScheme) => {
			setSchemeState(nextScheme);
			await AsyncStorage.setItem(APP_THEME_STORAGE_KEY, nextScheme);
		},
		[]
	);

	const toggleScheme = useCallback(async () => {
		await setScheme(scheme === "dark" ? "light" : "dark");
	}, [scheme, setScheme]);

	const value = useMemo(
		() => ({
			scheme,
			isDark: scheme === "dark",
			colors: Colors[scheme],
			setScheme,
			toggleScheme
		}),
		[scheme, setScheme, toggleScheme]
	);

	const themeVars = useMemo(() => {
		const theme = ThemeHsl[scheme];

		return vars({
			"--background": theme.background,
			"--foreground": theme.foreground,
			"--card": theme.card,
			"--card-foreground": theme.cardForeground,
			"--popover": theme.popover,
			"--popover-foreground": theme.popoverForeground,
			"--primary": theme.primary,
			"--primary-foreground": theme.primaryForeground,
			"--secondary": theme.secondary,
			"--secondary-foreground": theme.secondaryForeground,
			"--muted": theme.muted,
			"--muted-foreground": theme.mutedForeground,
			"--accent": theme.accent,
			"--accent-foreground": theme.accentForeground,
			"--destructive": theme.destructive,
			"--destructive-foreground": theme.destructiveForeground,
			"--border": theme.border,
			"--input": theme.input,
			"--ring": theme.ring
		});
	}, [scheme]);

	return (
		<AppThemeContext.Provider value={value}>
			<View
				className={scheme === "dark" ? "dark flex-1" : "flex-1"}
				style={themeVars}
			>
				{children}
			</View>
		</AppThemeContext.Provider>
	);
}

export function useAppTheme() {
	const context = useContext(AppThemeContext);

	if (!context) {
		throw new Error("useAppTheme must be used inside AppThemeProvider");
	}

	return context;
}
