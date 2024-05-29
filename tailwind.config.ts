import type { Config } from 'tailwindcss';

export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './app/**/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {},
		space: {
			between: 'space-between',
		},
	},
	plugins: [],
} satisfies Config;
