import { Class } from '@repo/core'
import { Elysia, status } from 'elysia'
import type { OAuthStateRepository } from '@/modules/auth-and-users/domain/application/repositories/oauth-state-repository'
import type { OAuthProviderService } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { OAuthProvider } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { Type } from '@sinclair/typebox'

const OAUTH_STATE_EXPIRY_SECONDS = 600 // 10 minutes

type SocialLoginInitiateRouteProps = {
	oauthProviderService: OAuthProviderService
	oauthStateRepository: OAuthStateRepository
}

export class SocialLoginInitiateRoute extends Class<SocialLoginInitiateRouteProps> {
	constructor(protected override props: SocialLoginInitiateRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().get(
			'/social/:provider',
			async ({ params: { provider }, query: { role } }) => {
				if (
					!OAuthProvider.includes(provider as (typeof OAuthProvider)[number])
				) {
					return status(400, { error: 'Provider não suportado' })
				}

				const { url, state, codeVerifier } =
					this.props.oauthProviderService.createAuthorizationURL(
						provider as (typeof OAuthProvider)[number]
					)

				await this.props.oauthStateRepository.save(
					state,
					{
						codeVerifier,
						provider,
						role: role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
					},
					OAUTH_STATE_EXPIRY_SECONDS
				)

				return new Response(null, {
					status: 302,
					headers: { Location: url.toString() },
				})
			},
			{
				detail: { summary: 'Iniciar login social', tags: ['Auth'] },
				query: Type.Object({
					role: Type.Union([
						Type.Literal('ADMIN'),
						Type.Literal('INSTRUCTOR'),
						Type.Literal('STUDENT'),
					]),
				}),
			}
		)
	}
}
