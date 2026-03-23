import { and, eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { UniqueId } from '@repo/core'
import {
	OAuthAccountRepository,
	type OAuthAccountRecord,
} from '../../../domain/application/repositories/oauth-account-repository'
import { oauthAccounts } from '../schema'
import { OAuthAccountMapper } from '../mappers/oauth-account-mapper'

export class DrizzleOAuthAccountRepository extends OAuthAccountRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async findByProviderAndAccountId(
		provider: string,
		providerAccountId: string
	): Promise<OAuthAccountRecord | null> {
		const [row] = await this.db
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
		await this.db
			.insert(oauthAccounts)
			.values(OAuthAccountMapper.toInsert({ id, ...data }))
		return { id }
	}
}
