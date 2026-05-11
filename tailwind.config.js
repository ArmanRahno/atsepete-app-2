/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	// NOTE: Update this to include the paths to all of your component files.
	content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				// Single-value tokens (border, input, ring, etc.)
				border: {
					DEFAULT: "hsl(var(--border))",
					dark: "hsl(var(--border))"
				},
				input: {
					DEFAULT: "hsl(var(--input))",
					dark: "hsl(var(--input))"
				},
				ring: {
					DEFAULT: "hsl(var(--ring))",
					dark: "hsl(var(--ring))"
				},
				background: {
					DEFAULT: "hsl(var(--background))",
					dark: "hsl(var(--background))"
				},
				foreground: {
					DEFAULT: "hsl(var(--foreground))",
					dark: "hsl(var(--foreground))"
				},

				// Multi-value tokens (primary, secondary, destructive, etc.)
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					dark: "hsl(var(--primary))",
					"foreground-dark": "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
					dark: "hsl(var(--secondary))",
					"foreground-dark": "hsl(var(--secondary-foreground))"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
					dark: "hsl(var(--destructive))",
					"foreground-dark": "hsl(var(--destructive-foreground))"
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
					dark: "hsl(var(--muted))",
					"foreground-dark": "hsl(var(--muted-foreground))"
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
					dark: "hsl(var(--accent))",
					"foreground-dark": "hsl(var(--accent-foreground))"
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
					dark: "hsl(var(--popover))",
					"foreground-dark": "hsl(var(--popover-foreground))"
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
					dark: "hsl(var(--card))",
					"foreground-dark": "hsl(var(--card-foreground))"
				}
			},
			borderRadius: {
				lg: `0.75rem`,
				md: `calc(0.75rem - 2px)`,
				sm: "calc(0.75rem - 4px)"
			}
		}
	},
	plugins: [require("tailwindcss-animate")]
};
