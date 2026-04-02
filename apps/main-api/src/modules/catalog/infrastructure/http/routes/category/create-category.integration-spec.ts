import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { jsonReq } from '@/test/http-helpers'
import { CreateCategoryRoute } from './create-category'
import { CreateCategoryUseCase } from '@/modules/catalog/application/use-cases'
import { CategoryNotFoundError } from '@/modules/catalog/application/@errors'
import { makeCategory } from '@/modules/catalog/test/factories/make-category'

describe('CreateCategoryRoute', () => {
	let useCase: CreateCategoryUseCase
	let route: CreateCategoryRoute

	beforeEach(() => {
		useCase = mock(CreateCategoryUseCase)
		route = new CreateCategoryRoute({
			createCategoryUseCase: instance(useCase),
		})
	})

	it('POST / → 201 with created category', async () => {
		const category = await makeCategory({ name: 'Dev', slug: 'dev' })
		when(useCase.execute(anything())).thenResolve(success({ category }))

		const res = await jsonReq(route.getRoute(), 'POST', '/', {
			name: 'Dev',
		})

		expect(res.status).toBe(201)
	})

	it('POST / → 422 when use case fails', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new CategoryNotFoundError('Parent category not found'))
		)

		const res = await jsonReq(route.getRoute(), 'POST', '/', {
			name: 'Subcategoria',
			parentId: 'nonexistent-id',
		})

		expect(res.status).toBe(422)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
