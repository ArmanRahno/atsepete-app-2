export const semanticLightRed = "#DC2626";
export const semanticDarkRed = "#EF4444";

export const semanticLightGreen = "#065F46";
export const semanticDarkGreen = "#86EFAC";

export function semanticRed(isDark: boolean) {
	return isDark ? semanticDarkRed : semanticLightRed;
}

export function semanticGreen(isDark: boolean) {
	return isDark ? semanticDarkGreen : semanticLightGreen;
}
