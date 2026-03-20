import { config as baseConfig } from './base.js'

/**
 * A custom ESLint configuration for libraries that use Next.js.
 * Only enforces @typescript-eslint/explicit-override via base config.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [...baseConfig]
