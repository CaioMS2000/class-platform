import type { UniqueId } from '@repo/core'
import type { Role } from '../../models/@types'

export abstract class RefreshTokenRepository {
	abstract save(
		userId: UniqueId,
		tokenHash: string,
		expiresInSeconds: number,
		role: Role
	): Promise<void>
	abstract findByTokenHash(tokenHash: string): Promise<{
		userId: UniqueId
		used: boolean
		role: Role
	} | null>
	abstract revoke(tokenHash: string): Promise<void>
	abstract revokeAllForUser(userId: UniqueId): Promise<void>
	abstract markUsed(tokenHash: string): Promise<boolean>
}
