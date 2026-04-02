import { describe, it, expect, beforeEach } from 'bun:test'
import { Elysia } from 'elysia'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { req } from '@/test/http-helpers'
import { GetAdminMeRoute } from './get-admin-me'
import { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { AdminNotFoundError } from '@/modules/auth-and-users/domain/application/@errors'
import { makeAdmin } from '@/modules/auth-and-users/test/factories/make-admin'

describe('GetAdminMeRoute', () => {
	let useCase: GetAdminUseCase
	let route: GetAdminMeRoute

	beforeEach(() => {
		useCase = mock(GetAdminUseCase)
		route = new GetAdminMeRoute({ getAdminUseCase: instance(useCase) })
	})

	function createAppWithUser(userOverrides = {}) {
		return new Elysia()
			.derive(() => ({
				user: {
					id: 'admin-1',
					name: 'Admin',
					email: 'admin@test.com',
					role: 'ADMIN',
					...userOverrides,
				},
			}))
			.use(route.getRoute())
	}

	it('GET /me → 200 with admin data', async () => {
		const admin = await makeAdmin({
			name: 'Admin',
			email: 'admin@test.com',
			status: 'active',
		})
		when(useCase.execute(anything())).thenResolve(success({ admin }))

		const app = createAppWithUser()
		const res = await req(app, '/me')

		expect(res.status).toBe(200)
	})

	it('GET /me → 404 when admin not found', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new AdminNotFoundError())
		)

		const app = createAppWithUser()
		const res = await req(app, '/me')

		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
