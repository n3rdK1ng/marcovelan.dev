import type { Config } from 'tailwindcss'

const config = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		container: {
			center: true,
			padding: '24px',
			screens: {
				lg: '1024px',
			},
		},
		extend: {},
	},
	plugins: [],
} satisfies Config

export default config
