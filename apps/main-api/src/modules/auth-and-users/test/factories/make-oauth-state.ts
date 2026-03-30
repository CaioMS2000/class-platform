import type { Role } from '@/modules/auth-and-users/domain/models/@types'

export function makeOAuthStateData(
	overrides: Partial<{
		state: string
		codeVerifier: string
		provider: string
		role: Role
		expiresInSeconds: number
	}> = {}
) {
	return {
		state: overrides.state ?? `state-${crypto.randomUUID()}`,
		data: {
			codeVerifier: overrides.codeVerifier ?? `verifier-${crypto.randomUUID()}`,
			provider: overrides.provider ?? 'google',
			role: overrides.role ?? ('STUDENT' as const),
		},
		expiresInSeconds: overrides.expiresInSeconds ?? 600,
	}
}
