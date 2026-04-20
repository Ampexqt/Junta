import tailwindcssAnimate from "tailwindcss-animate";

export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}'
	],
	darkMode: ['selector', 'class'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				background: 'hsl(var(--background) / <alpha-value>)',
				'background-alt': 'hsl(var(--background-alt) / <alpha-value>)',
				surface: 'hsl(var(--surface) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
				'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
				card: 'hsl(var(--card) / <alpha-value>)',
				'card-foreground': 'hsl(var(--card-foreground) / <alpha-value>)',
				popover: 'hsl(var(--popover) / <alpha-value>)',
				'popover-foreground': 'hsl(var(--popover-foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					50: 'hsl(var(--primary-50) / <alpha-value>)',
					100: 'hsl(var(--primary-100) / <alpha-value>)',
					200: 'hsl(var(--primary-200) / <alpha-value>)',
					300: 'hsl(var(--primary-300) / <alpha-value>)',
					400: 'hsl(var(--primary-400) / <alpha-value>)',
					500: 'hsl(var(--primary-500) / <alpha-value>)',
					600: 'hsl(var(--primary-600) / <alpha-value>)',
					700: 'hsl(var(--primary-700) / <alpha-value>)',
					800: 'hsl(var(--primary-800) / <alpha-value>)',
					900: 'hsl(var(--primary-900) / <alpha-value>)',
					950: 'hsl(var(--primary-950) / <alpha-value>)',
					hover: 'hsl(var(--primary-hover) / <alpha-value>)',
					active: 'hsl(var(--primary-active) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
				},
				emerald: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					50: 'hsl(var(--primary-50) / <alpha-value>)',
					100: 'hsl(var(--primary-100) / <alpha-value>)',
					200: 'hsl(var(--primary-200) / <alpha-value>)',
					300: 'hsl(var(--primary-300) / <alpha-value>)',
					400: 'hsl(var(--primary-400) / <alpha-value>)',
					500: 'hsl(var(--primary-500) / <alpha-value>)',
					600: 'hsl(var(--primary-600) / <alpha-value>)',
					700: 'hsl(var(--primary-700) / <alpha-value>)',
					800: 'hsl(var(--primary-800) / <alpha-value>)',
					900: 'hsl(var(--primary-900) / <alpha-value>)',
					950: 'hsl(var(--primary-950) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					500: 'hsl(var(--secondary-500) / <alpha-value>)',
					400: 'hsl(var(--secondary-400) / <alpha-value>)',
					300: 'hsl(var(--secondary-300) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					600: 'hsl(var(--accent-600) / <alpha-value>)',
					500: 'hsl(var(--accent-500) / <alpha-value>)',
					300: 'hsl(var(--accent-300) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					500: 'hsl(var(--destructive-500) / <alpha-value>)',
					400: 'hsl(var(--destructive-400) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
				},
				success: 'hsl(var(--success) / <alpha-value>)',
				warning: 'hsl(var(--warning) / <alpha-value>)',
				info: 'hsl(var(--info) / <alpha-value>)',
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				'grad-from': 'hsl(var(--grad-from) / <alpha-value>)',
				'grad-to': 'hsl(var(--grad-to) / <alpha-value>)',
				'chart-1': 'hsl(var(--chart-1) / <alpha-value>)',
				'chart-2': 'hsl(var(--chart-2) / <alpha-value>)',
				'chart-3': 'hsl(var(--chart-3) / <alpha-value>)',
				'chart-4': 'hsl(var(--chart-4) / <alpha-value>)',
				'chart-5': 'hsl(var(--chart-5) / <alpha-value>)',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar) / <alpha-value>)',
					foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
					primary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
					accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
					border: 'hsl(var(--sidebar-border) / <alpha-value>)',
					ring: 'hsl(var(--sidebar-ring) / <alpha-value>)'
				},
			},
			fontFamily: {
				brand: [
					'Lora',
					'serif'
				],
				heading: [
					'Geist Variable',
					'sans-serif'
				],
				body: [
					'Open Sans',
					'sans-serif'
				],
				mono: [
					'Geist Mono"',
					'monospace'
				]
			}
		}
	},
	plugins: [tailwindcssAnimate]
}