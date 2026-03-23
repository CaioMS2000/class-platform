import { drizzle as _drizzle } from 'drizzle-orm/node-postgres'
import 'dotenv/config'
import { env } from '@/config/env'
import * as authSchema from '@/modules/auth-and-users/infrastructure/database/schema'
import * as catalogSchema from '@/modules/catalog/infrastructure/database/schema'

export const schema = {
	...authSchema,
	...catalogSchema,
}

export const drizzle = _drizzle(env.DATABASE_URL, { schema })
