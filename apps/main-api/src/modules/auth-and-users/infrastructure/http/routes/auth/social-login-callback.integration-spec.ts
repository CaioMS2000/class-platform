import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success } from '@repo/core'
import { req } from '@/test/http-helpers'
import { SocialLoginCallbackRoute } from './social-login-callback'
import { SocialLoginUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { OAuthProviderService } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { OAuthStateRepository } from '@/modules/auth-and-users/domain/application/repositories/oauth-state-repository'

describe('SocialLoginCallbackRoute', () => {
	let socialLoginUseCase: SocialLoginUseCase
	let oauthProviderService: OAuthProviderService
	let oauthStateRepository: OAuthStateRepository
	let route: SocialLoginCallbackRoute

	beforeEach(() => {
		socialLoginUseCase = mock(SocialLoginUseCase)
		oauthProviderService = mock(OAuthProviderService)
		oauthStateRepository = mock(OAuthStateRepository)
		route = new SocialLoginCallbackRoute({
			socialLoginUseCase: instance(socialLoginUseCase),
			oauthProviderService: instance(oauthProviderService),
			oauthStateRepository: instance(oauthStateRepository),
		})
	})

	it('GET /social/google/callback?code=X&state=Y → 200 with access_token and sets cookie', async () => {
		when(oauthStateRepository.findAndDelete(anything())).thenResolve({
			codeVerifier: 'verifier',
			provider: 'google',
			role: 'STUDENT',
		})
		when(
			oauthProviderService.validateCodeAndGetProfile(
				anything(),
				anything(),
				anything()
			)
		).thenResolve({
			providerAccountId: 'google-123',
			email: 'joao@gmail.com',
			name: 'João',
		})
		when(socialLoginUseCase.execute(anything())).thenResolve(
			success({
				accessToken: 'jwt-access-token',
				refreshToken: 'jwt-refresh-token',
				user: {
					id: 'user-1',
					name: 'João',
					email: 'joao@gmail.com',
					role: 'STUDENT',
				},
				isNewUser: false,
			})
		)

		const res = await req(
			route.getRoute(),
			'/social/google/callback?code=auth-code&state=valid-state'
		)

		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body).toHaveProperty('access_token')

		const setCookie = res.headers.get('set-cookie')
		expect(setCookie).toContain('refresh_token=')
	})

	it('GET /social/google/callback?code=X&state=invalid → 400 when state not found', async () => {
		when(oauthStateRepository.findAndDelete(anything())).thenResolve(null)

		const res = await req(
			route.getRoute(),
			'/social/google/callback?code=auth-code&state=invalid-state'
		)

		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
