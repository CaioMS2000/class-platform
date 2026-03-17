import type { UniqueId } from '@repo/core'

export type OAuthAccountRecord = {
	id: string
	userId: UniqueId
	provider: string
	providerAccountId: string
}

export abstract class OAuthAccountRepository {
	abstract findByProviderAndAccountId(
		provider: string,
		providerAccountId: string
	): Promise<OAuthAccountRecord | null>

	abstract save(data: {
		userId: UniqueId
		provider: string
		providerAccountId: string
	}): Promise<{ id: string }>
}
