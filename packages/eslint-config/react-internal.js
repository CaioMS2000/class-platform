import { config as baseConfig } from './base.js'

/**
 * A custom ESLint configuration for libraries that use React.
 * Only enforces @typescript-eslint/explicit-override via base config.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [...baseConfig]
