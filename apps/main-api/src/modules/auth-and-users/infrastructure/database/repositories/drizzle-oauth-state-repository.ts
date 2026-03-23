import { and, eq, gt } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import {
	OAuthStateRepository,
	type OAuthStateData,
} from '../../../domain/application/repositories/oauth-state-repository'
import { oauthStates } from '../schema'
import { OAuthStateMapper } from '../mappers/oauth-state-mapper'

export class DrizzleOAuthStateRepository extends OAuthStateRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(
		state: string,
		data: OAuthStateData,
		expiresInSeconds: number
	): Promise<void> {
		await this.db
			.insert(oauthStates)
			.values(OAuthStateMapper.toInsert(state, data, expiresInSeconds))
	}

	async findAndDelete(state: string): Promise<OAuthStateData | null> {
		const [row] = await this.db
			.delete(oauthStates)
			.where(
				and(eq(oauthStates.state, state), gt(oauthStates.expiresAt, new Date()))
			)
			.returning()
		if (!row) return null
		return OAuthStateMapper.toDomain(row)
	}
}
