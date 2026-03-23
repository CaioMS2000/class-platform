import { and, eq } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import type { UniqueId } from '@repo/core'
import {
	OAuthAccountRepository,
	type OAuthAccountRecord,
} from '../../../domain/application/repositories/oauth-account-repository'
import { oauthAccounts } from '../schema'
import { OAuthAccountMapper } from '../mappers/oauth-account-mapper'

export class DrizzleOAuthAccountRepository extends OAuthAccountRepository {
	async findByProviderAndAccountId(
		provider: string,
		providerAccountId: string
	): Promise<OAuthAccountRecord | null> {
		const [row] = await drizzle
			.select()
			.from(oauthAccounts)
			.where(
				and(
					eq(oauthAccounts.provider, provider),
					eq(oauthAccounts.providerAccountId, providerAccountId)
				)
			)
		if (!row) return null
		return OAuthAccountMapper.toDomain(row)
	}

	async save(data: {
		userId: UniqueId
		provider: string
		providerAccountId: string
	}): Promise<{ id: string }> {
		const id = crypto.randomUUID()
		await drizzle
			.insert(oauthAccounts)
			.values(OAuthAccountMapper.toInsert({ id, ...data }))
		return { id }
	}
}
