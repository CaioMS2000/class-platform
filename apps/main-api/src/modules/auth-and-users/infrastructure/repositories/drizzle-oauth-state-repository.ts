import { and, eq, gt } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import {
	OAuthStateRepository,
	type OAuthStateData,
} from '../../domain/application/repositories/oauth-state-repository'
import { oauthStates } from '../database/schema'

export class DrizzleOAuthStateRepository extends OAuthStateRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(
		state: string,
		data: OAuthStateData,
		expiresInSeconds: number
	): Promise<void> {
		await this.db.insert(oauthStates).values({
			state,
			codeVerifier: data.codeVerifier,
			provider: data.provider,
			expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
		})
	}

	async findAndDelete(state: string): Promise<OAuthStateData | null> {
		const [row] = await this.db
			.delete(oauthStates)
			.where(
				and(eq(oauthStates.state, state), gt(oauthStates.expiresAt, new Date()))
			)
			.returning()
		if (!row) return null
		return {
			codeVerifier: row.codeVerifier,
			provider: row.provider,
		}
	}
}
