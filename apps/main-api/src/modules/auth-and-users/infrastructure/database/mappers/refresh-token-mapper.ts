import type { UniqueId } from '@repo/core'
import type { refreshTokens } from '../schema'

type Row = typeof refreshTokens.$inferSelect
type InsertRow = typeof refreshTokens.$inferInsert

type RefreshTokenRecord = {
	userId: UniqueId
	used: boolean
	role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

export class RefreshTokenMapper {
	static toDomain(row: Row): RefreshTokenRecord {
		return {
			userId: row.userId as UniqueId,
			used: row.used,
			role: row.role,
		}
	}

	static toInsert(
		id: string,
		userId: UniqueId,
		tokenHash: string,
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
		expiresInSeconds: number
	): InsertRow {
		return {
			id,
			userId,
			tokenHash,
			role,
			used: false,
			expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
		}
	}
}
