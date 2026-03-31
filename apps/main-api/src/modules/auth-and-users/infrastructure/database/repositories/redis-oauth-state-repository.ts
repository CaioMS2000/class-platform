import { redis } from '@/lib/redis'
import {
	OAuthStateRepository,
	type OAuthStateData,
} from '../../../domain/application/repositories/oauth-state-repository'

const KEY_PREFIX = 'oauth_state:'

export class RedisOAuthStateRepository extends OAuthStateRepository {
	async save(
		state: string,
		data: OAuthStateData,
		expiresInSeconds: number
	): Promise<void> {
		await redis.setex(
			`${KEY_PREFIX}${state}`,
			expiresInSeconds,
			JSON.stringify(data)
		)
	}

	async findAndDelete(state: string): Promise<OAuthStateData | null> {
		const key = `${KEY_PREFIX}${state}`
		const raw = await redis.getdel(key)
		if (!raw) return null
		return JSON.parse(raw) as OAuthStateData
	}
}
