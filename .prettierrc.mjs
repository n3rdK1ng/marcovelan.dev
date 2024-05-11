/** @type {import("prettier").Options} */
export default {
	arrowParens: 'avoid',
	bracketSpacing: true,
	endOfLine: 'lf',
	printWidth: 80,
	semi: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
	plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
}
