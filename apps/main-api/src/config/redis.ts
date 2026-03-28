import { env } from './env'

export const redis = new Bun.Redis(env.REDIS_URL)
