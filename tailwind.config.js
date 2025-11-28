/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				// Single-value tokens (border, input, ring, etc.)
				border: {
					DEFAULT: "hsl(220, 13%, 91%)", // --border
					dark: "hsl(215, 27.9%, 16.9%)" // .dark --border
				},
				input: {
					DEFAULT: "hsl(220, 13%, 91%)", // --input
					dark: "hsl(215, 27.9%, 16.9%)" // .dark --input
				},
				ring: {
					DEFAULT: "hsl(262.1, 83.3%, 57.8%)", // --ring
					dark: "hsl(263.4, 70%, 50.4%)" // .dark --ring
				},
				background: {
					DEFAULT: "hsl(0, 0%, 100%)", // --background
					dark: "hsl(224, 71.4%, 4.1%)" // .dark --background
				},
				foreground: {
					DEFAULT: "hsl(224, 71.4%, 4.1%)", // --foreground
					dark: "hsl(210, 20%, 98%)" // .dark --foreground
				},

				// Multi-value tokens (primary, secondary, destructive, etc.)
				primary: {
					DEFAULT: "hsl(262.1, 83.3%, 57.8%)", // --primary
					foreground: "hsl(210, 20%, 98%)", // --primary-foreground
					dark: "hsl(263.4, 70%, 50.4%)", // .dark --primary
					"foreground-dark": "hsl(210, 20%, 98%)"
				},
				secondary: {
					DEFAULT: "hsl(220, 14.3%, 95.9%)", // --secondary
					foreground: "hsl(220.9, 39.3%, 11%)", // --secondary-foreground
					dark: "hsl(215, 27.9%, 16.9%)", // .dark --secondary
					"foreground-dark": "hsl(210, 20%, 98%)"
				},
				destructive: {
					DEFAULT: "hsl(0, 84.2%, 60.2%)", // --destructive
					foreground: "hsl(210, 20%, 98%)", // --destructive-foreground
					dark: "hsl(0, 62.8%, 30.6%)", // .dark --destructive
					"foreground-dark": "hsl(210, 20%, 98%)"
				},
				muted: {
					DEFAULT: "hsl(220, 14.3%, 95.9%)", // --muted
					foreground: "hsl(220, 8.9%, 46.1%)", // --muted-foreground
					dark: "hsl(215, 27.9%, 16.9%)", // .dark --muted
					"foreground-dark": "hsl(217.9, 10.6%, 64.9%)"
				},
				accent: {
					DEFAULT: "hsl(220, 14.3%, 95.9%)", // --accent
					foreground: "hsl(220.9, 39.3%, 11%)", // --accent-foreground
					dark: "hsl(215, 27.9%, 16.9%)", // .dark --accent
					"foreground-dark": "hsl(210, 20%, 98%)"
				},
				popover: {
					DEFAULT: "hsl(0, 0%, 100%)", // --popover
					foreground: "hsl(224, 71.4%, 4.1%)", // --popover-foreground
					dark: "hsl(224, 71.4%, 4.1%)", // .dark --popover
					"foreground-dark": "hsl(210, 20%, 98%)"
				},
				card: {
					DEFAULT: "hsl(0, 0%, 100%)", // --card
					foreground: "hsl(224, 71.4%, 4.1%)", // --card-foreground
					dark: "hsl(224, 71.4%, 4.1%)", // .dark --card
					"foreground-dark": "hsl(210, 20%, 98%)"
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
