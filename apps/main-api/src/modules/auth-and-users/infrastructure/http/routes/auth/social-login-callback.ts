import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import type { SocialLoginUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import type { OAuthStateRepository } from '@/modules/auth-and-users/domain/application/repositories/oauth-state-repository'
import type { OAuthProviderService } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { OAuthProvider } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { Type } from '@sinclair/typebox'
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '@/modules/auth-and-users/domain/application/constants'
import { status } from 'elysia'

type SocialLoginCallbackRouteProps = {
	socialLoginUseCase: SocialLoginUseCase
	oauthProviderService: OAuthProviderService
	oauthStateRepository: OAuthStateRepository
}

export class SocialLoginCallbackRoute extends Class<SocialLoginCallbackRouteProps> {
	constructor(protected override props: SocialLoginCallbackRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().get(
			'/social/:provider/callback',
			async ({ params: { provider }, query: { code, state }, cookie }) => {
				const stateData =
					await this.props.oauthStateRepository.findAndDelete(state)

				if (!stateData) {
					return status(400, { error: 'Estado OAuth inválido ou expirado' })
				}

				const profile =
					await this.props.oauthProviderService.validateCodeAndGetProfile(
						provider as (typeof OAuthProvider)[number],
						code,
						stateData.codeVerifier
					)

				const result = await this.props.socialLoginUseCase.execute({
					provider,
					providerAccountId: profile.providerAccountId,
					email: profile.email,
					name: profile.name,
					role: stateData.role,
				})

				const { accessToken, refreshToken } = result.value

				cookie.refresh_token?.set({
					value: refreshToken,
					httpOnly: true,
					secure: true,
					sameSite: 'strict',
					maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
					path: '/',
				})

				return { access_token: accessToken }
			},
			{
				detail: { summary: 'Callback do login social', tags: ['Auth'] },
				query: Type.Object({
					code: Type.String(),
					state: Type.String(),
				}),
			}
		)
	}
}
