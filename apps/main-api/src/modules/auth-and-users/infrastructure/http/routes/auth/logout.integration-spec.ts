import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success } from '@repo/core'
import { req } from '@/test/http-helpers'
import { LogoutRoute } from './logout'
import { LogoutUseCase } from '@/modules/auth-and-users/domain/application/use-cases'

describe('LogoutRoute', () => {
	let useCase: LogoutUseCase
	let route: LogoutRoute

	beforeEach(() => {
		useCase = mock(LogoutUseCase)
		route = new LogoutRoute({ logoutUseCase: instance(useCase) })
	})

	it('POST /logout → 204 and removes cookie when refresh_token present', async () => {
		when(useCase.execute(anything())).thenResolve(success(undefined))

		const res = await req(route.getRoute(), '/logout', {
			method: 'POST',
			headers: { Cookie: 'refresh_token=some-token-value' },
		})

		expect(res.status).toBe(204)
	})

	it('POST /logout → 204 even without refresh_token cookie', async () => {
		const res = await req(route.getRoute(), '/logout', {
			method: 'POST',
		})

		expect(res.status).toBe(204)
	})
})
