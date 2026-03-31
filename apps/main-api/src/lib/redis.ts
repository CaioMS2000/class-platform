import { env } from '../config/env'

export const redis = new Bun.RedisClient(env.REDIS_URL)
