import { UniqueId } from '@repo/core'

export function makeRefreshTokenData(
	overrides: Partial<{
		userId: string
		tokenHash: string
		expiresInSeconds: number
		role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
	}> = {}
) {
	return {
		userId: UniqueId(overrides.userId ?? `user-${crypto.randomUUID()}`),
		tokenHash: overrides.tokenHash ?? `token-hash-${crypto.randomUUID()}`,
		expiresInSeconds: overrides.expiresInSeconds ?? 3600,
		role: overrides.role ?? ('STUDENT' as const),
	}
}
