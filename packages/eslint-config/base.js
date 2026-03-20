import tseslint from 'typescript-eslint'

/**
 * A shared ESLint configuration for the repository.
 * Stripped down to only enforce @typescript-eslint/explicit-override.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
	// Only the parser/plugin setup — sem regras recommended
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
		},
		rules: {},
	},
	{
		ignores: ['dist/**'],
	},
]
