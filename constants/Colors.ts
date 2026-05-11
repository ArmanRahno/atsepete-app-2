export type AppColorScheme = "light" | "dark";

export const APP_THEME_STORAGE_KEY = "atsepete-color-scheme";

export const ThemeHsl = {
	light: {
		background: "36 28% 92%",
		foreground: "24 18% 6%",
		card: "39 36% 96%",
		cardForeground: "24 18% 12%",
		popover: "39 36% 96%",
		popoverForeground: "24 18% 12%",
		primary: "262.1 83.3% 57.8%",
		primaryForeground: "210 20% 98%",
		secondary: "34 22% 82%",
		secondaryForeground: "24 18% 16%",
		muted: "34 18% 80%",
		mutedForeground: "27 12% 29%",
		accent: "32 21% 80%",
		accentForeground: "24 18% 14%",
		destructive: "0 76% 56%",
		destructiveForeground: "210 20% 98%",
		border: "30 16% 64%",
		input: "30 16% 64%",
		ring: "262.1 83.3% 57.8%"
	},
	dark: {
		background: "30 18% 4%",
		foreground: "38 26% 88%",
		card: "30 17% 6%",
		cardForeground: "38 28% 91%",
		popover: "30 17% 6%",
		popoverForeground: "38 28% 91%",
		primary: "262.1 83.3% 57.8%",
		primaryForeground: "210 20% 98%",
		secondary: "30 10% 15%",
		secondaryForeground: "38 28% 91%",
		muted: "30 9% 15%",
		mutedForeground: "34 11% 64%",
		accent: "29 10% 16%",
		accentForeground: "38 28% 91%",
		destructive: "0 58% 46%",
		destructiveForeground: "210 20% 98%",
		border: "30 9% 20%",
		input: "30 9% 20%",
		ring: "262.1 83.3% 57.8%"
	}
} as const;

export const lightBackground = "#F0ECE5";
export const lightForeground = "#120F0D";
export const lightCard = "#F8F6F1";
export const lightCardForeground = "#241D19";
export const lightPopover = "#F8F6F1";
export const lightPopoverForeground = "#241D19";
export const lightPrimary = "#7C3AED";
export const lightPrimaryForeground = "#F9FAFB";
export const lightSecondary = "#DBD2C7";
export const lightSecondaryForeground = "#302721";
export const lightMuted = "#D5CDC3";
export const lightMutedForeground = "#534941";
export const lightAccent = "#D7CDC1";
export const lightAccentForeground = "#2A221D";
export const lightDestructive = "#E43A3A";
export const lightDestructiveForeground = "#F9FAFB";
export const lightBorder = "#B2A395";
export const lightInput = "#B2A395";
export const lightRing = "#7C3AED";
export const lightChart1 = "#E7C950";
export const lightChart2 = "#299D37";
export const lightChart3 = "#265347";
export const lightChart4 = "#E88C68";
export const lightChart5 = "#F4B262";

export const darkBackground = "#0C0A08";
export const darkForeground = "#E8E3D8";
export const darkCard = "#120F0D";
export const darkCardForeground = "#EEEAE2";
export const darkPopover = "#120F0D";
export const darkPopoverForeground = "#EEEAE2";
export const darkPrimary = "#7C3AED";
export const darkPrimaryForeground = "#F9FAFB";
export const darkSecondary = "#2A2622";
export const darkSecondaryForeground = "#EEEAE2";
export const darkMuted = "#2A2623";
export const darkMutedForeground = "#ADA599";
export const darkAccent = "#2D2925";
export const darkAccentForeground = "#EEEAE2";
export const darkDestructive = "#B93131";
export const darkDestructiveForeground = "#F9FAFB";
export const darkBorder = "#38332E";
export const darkInput = "#38332E";
export const darkRing = "#7C3AED";
export const darkChart1 = "#7C3AED";
export const darkChart2 = "#2DB85B";
export const darkChart3 = "#E88C30";
export const darkChart4 = "#8356DB";
export const darkChart5 = "#E2366F";

export const Colors = {
	light: {
		text: lightForeground,
		background: lightBackground,
		card: lightCard,
		cardText: lightCardForeground,
		popover: lightPopover,
		popoverText: lightPopoverForeground,
		tint: lightPrimary,
		primary: lightPrimary,
		primaryForeground: lightPrimaryForeground,
		secondary: lightSecondary,
		secondaryForeground: lightSecondaryForeground,
		muted: lightMuted,
		mutedForeground: lightMutedForeground,
		accent: lightAccent,
		accentForeground: lightAccentForeground,
		destructive: lightDestructive,
		destructiveForeground: lightDestructiveForeground,
		border: lightBorder,
		input: lightInput,
		ring: lightRing,
		icon: lightMutedForeground,
		tabIconDefault: lightMutedForeground,
		tabIconSelected: lightPrimary
	},
	dark: {
		text: darkForeground,
		background: darkBackground,
		card: darkCard,
		cardText: darkCardForeground,
		popover: darkPopover,
		popoverText: darkPopoverForeground,
		tint: darkPrimary,
		primary: darkPrimary,
		primaryForeground: darkPrimaryForeground,
		secondary: darkSecondary,
		secondaryForeground: darkSecondaryForeground,
		muted: darkMuted,
		mutedForeground: darkMutedForeground,
		accent: darkAccent,
		accentForeground: darkAccentForeground,
		destructive: darkDestructive,
		destructiveForeground: darkDestructiveForeground,
		border: darkBorder,
		input: darkInput,
		ring: darkRing,
		icon: darkMutedForeground,
		tabIconDefault: darkMutedForeground,
		tabIconSelected: darkPrimary
	}
};

export function getThemeColors(scheme: AppColorScheme) {
	return Colors[scheme];
}
