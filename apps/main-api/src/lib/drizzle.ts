import { drizzle as _drizzle } from 'drizzle-orm/node-postgres'
import 'dotenv/config'
import { env } from '@/config/env'

export const drizzle = _drizzle(env.DATABASE_URL /*{ schema }*/)
