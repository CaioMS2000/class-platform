import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { req } from '@/test/http-helpers'
import { RefreshTokenRoute } from './refresh-token'
import { RefreshTokenUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { InvalidRefreshTokenError } from '@/modules/auth-and-users/domain/application/@errors/invalid-refresh-token-error'

describe('RefreshTokenRoute', () => {
	let useCase: RefreshTokenUseCase
	let route: RefreshTokenRoute

	beforeEach(() => {
		useCase = mock(RefreshTokenUseCase)
		route = new RefreshTokenRoute({
			refreshTokenUseCase: instance(useCase),
		})
	})

	it('POST /refresh → 200 with new access_token and sets new cookie', async () => {
		when(useCase.execute(anything())).thenResolve(
			success({
				accessToken: 'new-access-token',
				refreshToken: 'new-refresh-token',
			})
		)

		const res = await req(route.getRoute(), '/refresh', {
			method: 'POST',
			headers: { Cookie: 'refresh_token=old-refresh-token' },
		})

		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body).toHaveProperty('access_token')

		const setCookie = res.headers.get('set-cookie')
		expect(setCookie).toContain('refresh_token=')
	})

	it('POST /refresh → 401 when no cookie', async () => {
		const res = await req(route.getRoute(), '/refresh', {
			method: 'POST',
		})

		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})

	it('POST /refresh → 401 when use case fails', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new InvalidRefreshTokenError())
		)

		const res = await req(route.getRoute(), '/refresh', {
			method: 'POST',
			headers: { Cookie: 'refresh_token=invalid-token' },
		})

		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
