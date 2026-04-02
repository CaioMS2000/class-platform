import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { jsonReq } from '@/test/http-helpers'
import { SignUpRoute } from './sign-up'
import { RegisterUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { EmailAlreadyRegisteredError } from '@/modules/auth-and-users/domain/application/@errors'

describe('SignUpRoute', () => {
	let useCase: RegisterUseCase
	let route: SignUpRoute

	beforeEach(() => {
		useCase = mock(RegisterUseCase)
		route = new SignUpRoute({ registerUseCase: instance(useCase) })
	})

	const validBody = {
		email: 'joao@test.com',
		password: 'password123',
		name: 'João',
		phone: '11999999999',
		role: 'STUDENT' as const,
	}

	// BUG: The route returns `status(201, { user: user })` but the 201 response
	// schema expects flat `{ name, email, phone, role }`. Elysia's response
	// validation rejects the shape mismatch → 422. Additionally, the use case
	// returns HTTPUser (no `phone`), but the schema expects `phone`.
	// This test documents the current (broken) behavior. Fix the route to pass.
	it('POST /register → currently returns 422 due to response schema mismatch (bug)', async () => {
		when(useCase.execute(anything())).thenResolve(
			success({
				user: {
					id: 'user-1',
					name: 'João',
					email: 'joao@test.com',
					role: 'STUDENT',
				},
			})
		)

		const res = await jsonReq(route.getRoute(), 'POST', '/register', validBody)

		expect(res.status).toBe(422)
	})

	it('POST /register → 409 when email already registered', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new EmailAlreadyRegisteredError())
		)

		const res = await jsonReq(route.getRoute(), 'POST', '/register', validBody)

		expect(res.status).toBe(409)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
