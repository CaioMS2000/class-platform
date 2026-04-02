import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { req } from '@/test/http-helpers'
import { SocialLoginInitiateRoute } from './social-login-initiate'
import { OAuthProviderService } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { OAuthStateRepository } from '@/modules/auth-and-users/domain/application/repositories/oauth-state-repository'

describe('SocialLoginInitiateRoute', () => {
	let oauthProviderService: OAuthProviderService
	let oauthStateRepository: OAuthStateRepository
	let route: SocialLoginInitiateRoute

	beforeEach(() => {
		oauthProviderService = mock(OAuthProviderService)
		oauthStateRepository = mock(OAuthStateRepository)
		route = new SocialLoginInitiateRoute({
			oauthProviderService: instance(oauthProviderService),
			oauthStateRepository: instance(oauthStateRepository),
		})
	})

	it('GET /social/google?role=STUDENT → 302 with Location header', async () => {
		when(oauthProviderService.createAuthorizationURL(anything())).thenReturn({
			url: new URL('https://accounts.google.com/o/oauth2/auth'),
			state: 'random-state',
			codeVerifier: 'random-verifier',
		})
		when(
			oauthStateRepository.save(anything(), anything(), anything())
		).thenResolve()

		const res = await req(route.getRoute(), '/social/google?role=STUDENT')

		expect(res.status).toBe(302)
		expect(res.headers.get('location')).toContain('accounts.google.com')
	})

	it('GET /social/invalid-provider?role=STUDENT → 400', async () => {
		const res = await req(
			route.getRoute(),
			'/social/invalid-provider?role=STUDENT'
		)

		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
