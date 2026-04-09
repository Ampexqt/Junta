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
				background: 'var(--background)',
				'background-alt': 'var(--background-alt)',
				surface: 'var(--surface)',
				foreground: 'var(--foreground)',
				'text-secondary': 'var(--text-secondary)',
				'text-muted': 'var(--text-muted)',
				card: 'var(--card)',
				'card-foreground': 'var(--card-foreground)',
				popover: 'var(--popover)',
				'popover-foreground': 'var(--popover-foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					600: 'var(--primary-600)',
					500: 'var(--primary-500)',
					400: 'var(--primary-400)',
					300: 'var(--primary-300)',
					200: 'var(--primary-200)',
					hover: 'var(--primary-hover)',
					active: 'var(--primary-active)',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					500: 'var(--secondary-500)',
					400: 'var(--secondary-400)',
					300: 'var(--secondary-300)',
				},
				accent: {
					DEFAULT: 'var(--accent)',
					600: 'var(--accent-600)',
					500: 'var(--accent-500)',
					300: 'var(--accent-300)',
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					500: 'var(--destructive-500)',
					400: 'var(--destructive-400)',
				},
				success: 'var(--success)',
				warning: 'var(--warning)',
				info: 'var(--info)',
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				'grad-from': 'var(--grad-from)',
				'grad-to': 'var(--grad-to)',
				'chart-1': 'var(--chart-1)',
				'chart-2': 'var(--chart-2)',
				'chart-3': 'var(--chart-3)',
				'chart-4': 'var(--chart-4)',
				'chart-5': 'var(--chart-5)',
				sidebar: {
					DEFAULT: 'var(--sidebar)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				},
				'sidebar-foreground': 'var(--sidebar-foreground)',
				'sidebar-primary': 'var(--sidebar-primary)',
				'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
				'sidebar-accent': 'var(--sidebar-accent)',
				'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
				'sidebar-border': 'var(--sidebar-border)',
				'sidebar-ring': 'var(--sidebar-ring)',
				'destructive-foreground': 'var(--destructive-foreground)'
			},
			fontFamily: {
				brand: [
					'Lora',
					'serif'
				],
				heading: [
					'Montserrat',
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