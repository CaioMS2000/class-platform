import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { UniqueId } from '@repo/core'
import { RefreshTokenRepository } from '../../../domain/application/repositories/refresh-token-repository'
import { refreshTokens } from '../schema'
import { RefreshTokenMapper } from '../mappers/refresh-token-mapper'

export class DrizzleRefreshTokenRepository extends RefreshTokenRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async save(
		userId: UniqueId,
		tokenHash: string,
		expiresInSeconds: number,
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
	): Promise<void> {
		await this.db
			.insert(refreshTokens)
			.values(
				RefreshTokenMapper.toInsert(
					crypto.randomUUID(),
					userId,
					tokenHash,
					role,
					expiresInSeconds
				)
			)
	}

	async findByTokenHash(tokenHash: string): Promise<{
		userId: UniqueId
		used: boolean
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
	} | null> {
		const [row] = await this.db
			.select()
			.from(refreshTokens)
			.where(eq(refreshTokens.tokenHash, tokenHash))
		if (!row) return null
		return RefreshTokenMapper.toDomain(row)
	}

	async revoke(tokenHash: string): Promise<void> {
		await this.db
			.delete(refreshTokens)
			.where(eq(refreshTokens.tokenHash, tokenHash))
	}

	async revokeAllForUser(userId: UniqueId): Promise<void> {
		await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
	}

	async markUsed(tokenHash: string): Promise<void> {
		await this.db
			.update(refreshTokens)
			.set({ used: true })
			.where(eq(refreshTokens.tokenHash, tokenHash))
	}
}
