import { UniqueId } from '@repo/core'

export function makeOAuthAccountData(
	overrides: Partial<{
		userId: string
		provider: string
		providerAccountId: string
	}> = {}
) {
	return {
		userId: UniqueId(overrides.userId ?? `user-${crypto.randomUUID()}`),
		provider: overrides.provider ?? 'google',
		providerAccountId:
			overrides.providerAccountId ?? `provider-${crypto.randomUUID()}`,
	}
}
