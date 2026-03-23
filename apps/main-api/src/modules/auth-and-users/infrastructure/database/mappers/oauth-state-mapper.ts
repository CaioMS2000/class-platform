import type { OAuthStateData } from '../../../domain/application/repositories/oauth-state-repository'
import type { oauthStates } from '../schema'

type Row = typeof oauthStates.$inferSelect
type InsertRow = typeof oauthStates.$inferInsert

export class OAuthStateMapper {
	static toDomain(row: Row): OAuthStateData {
		return {
			codeVerifier: row.codeVerifier,
			provider: row.provider,
		}
	}

	static toInsert(
		state: string,
		data: OAuthStateData,
		expiresInSeconds: number
	): InsertRow {
		return {
			state,
			codeVerifier: data.codeVerifier,
			provider: data.provider,
			expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
		}
	}
}
