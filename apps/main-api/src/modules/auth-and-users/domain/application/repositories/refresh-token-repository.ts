import type { UniqueId } from '@repo/core'

export abstract class RefreshTokenRepository {
	abstract save(
		userId: UniqueId,
		tokenHash: string,
		expiresInSeconds: number,
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
	): Promise<void>
	abstract findByTokenHash(
		tokenHash: string
	): Promise<{
		userId: UniqueId
		used: boolean
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
	} | null>
	abstract revoke(tokenHash: string): Promise<void>
	abstract revokeAllForUser(userId: UniqueId): Promise<void>
	abstract markUsed(tokenHash: string): Promise<void>
}
