import { and, eq } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import type { UniqueId } from '@repo/core'
import { RefreshTokenRepository } from '../../../domain/application/repositories/refresh-token-repository'
import { refreshTokens } from '../schema'
import { RefreshTokenMapper } from '../mappers/refresh-token-mapper'

export class DrizzleRefreshTokenRepository extends RefreshTokenRepository {
	async save(
		userId: UniqueId,
		tokenHash: string,
		expiresInSeconds: number,
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
	): Promise<void> {
		await drizzle
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
		const [row] = await drizzle
			.select()
			.from(refreshTokens)
			.where(eq(refreshTokens.tokenHash, tokenHash))
		if (!row) return null
		return RefreshTokenMapper.toDomain(row)
	}

	async revoke(tokenHash: string): Promise<void> {
		await drizzle
			.delete(refreshTokens)
			.where(eq(refreshTokens.tokenHash, tokenHash))
	}

	async revokeAllForUser(userId: UniqueId): Promise<void> {
		await drizzle.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
	}

	async markUsed(tokenHash: string): Promise<boolean> {
		const result = await drizzle
			.update(refreshTokens)
			.set({ used: true })
			.where(
				and(
					eq(refreshTokens.tokenHash, tokenHash),
					eq(refreshTokens.used, false)
				)
			)
			.returning({ id: refreshTokens.id })

		return result.length > 0
	}
}
