import { and, eq, gt } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import {
	OAuthStateRepository,
	type OAuthStateData,
} from '../../../domain/application/repositories/oauth-state-repository'
import { oauthStates } from '../schema'
import { OAuthStateMapper } from '../mappers/oauth-state-mapper'

export class DrizzleOAuthStateRepository extends OAuthStateRepository {
	async save(
		state: string,
		data: OAuthStateData,
		expiresInSeconds: number
	): Promise<void> {
		await drizzle
			.insert(oauthStates)
			.values(OAuthStateMapper.toInsert(state, data, expiresInSeconds))
	}

	async findAndDelete(state: string): Promise<OAuthStateData | null> {
		const [row] = await drizzle
			.delete(oauthStates)
			.where(
				and(eq(oauthStates.state, state), gt(oauthStates.expiresAt, new Date()))
			)
			.returning()
		if (!row) return null
		return OAuthStateMapper.toDomain(row)
	}
}
