import type { UniqueId } from '@repo/core'
import type { OAuthAccountRecord } from '../../../domain/application/repositories/oauth-account-repository'
import type { oauthAccounts } from '../schema'

type Row = typeof oauthAccounts.$inferSelect
type InsertRow = typeof oauthAccounts.$inferInsert

export class OAuthAccountMapper {
	static toDomain(row: Row): OAuthAccountRecord {
		return {
			id: row.id,
			userId: row.userId as UniqueId,
			provider: row.provider,
			providerAccountId: row.providerAccountId,
		}
	}

	static toInsert(data: {
		id: string
		userId: UniqueId
		provider: string
		providerAccountId: string
	}): InsertRow {
		return {
			id: data.id,
			userId: data.userId,
			provider: data.provider,
			providerAccountId: data.providerAccountId,
		}
	}
}
