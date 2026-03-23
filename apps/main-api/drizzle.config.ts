import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	out: './drizzle',
	schema: [
		'./src/modules/auth-and-users/infrastructure/database/schema.ts',
		'./src/modules/catalog/infrastructure/database/schema.ts',
		'./src/modules/learning/infrastructure/database/schema.ts',
	],
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
