import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { jsonReq } from '@/test/http-helpers'
import { LoginRoute } from './login'
import { LoginUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { InvalidCredentialsError } from '@/modules/auth-and-users/domain/application/@errors'

describe('LoginRoute', () => {
	let useCase: LoginUseCase
	let route: LoginRoute

	beforeEach(() => {
		useCase = mock(LoginUseCase)
		route = new LoginRoute({ loginUseCase: instance(useCase) })
	})

	it('POST /login → 200 with access_token and sets refresh_token cookie', async () => {
		when(useCase.execute(anything())).thenResolve(
			success({
				accessToken: 'jwt-access-token',
				refreshToken: 'jwt-refresh-token',
				user: {
					id: 'user-1',
					name: 'João',
					email: 'joao@test.com',
					role: 'STUDENT',
				},
			})
		)

		const res = await jsonReq(route.getRoute(), 'POST', '/login', {
			email: 'joao@test.com',
			password: 'password123',
		})

		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body).toHaveProperty('access_token')

		const setCookie = res.headers.get('set-cookie')
		expect(setCookie).toContain('refresh_token=')
	})

	it('POST /login → 401 with invalid credentials', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new InvalidCredentialsError())
		)

		const res = await jsonReq(route.getRoute(), 'POST', '/login', {
			email: 'wrong@test.com',
			password: 'wrong',
		})

		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
