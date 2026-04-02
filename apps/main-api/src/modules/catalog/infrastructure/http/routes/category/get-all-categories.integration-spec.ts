import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when } from '@johanblumenberg/ts-mockito'
import { success } from '@repo/core'
import { req } from '@/test/http-helpers'
import { GetAllCategoriesRoute } from './get-all-categories'
import { GetAllCategoriesUseCase } from '@/modules/catalog/application/use-cases'
import { makeCategory } from '@/modules/catalog/test/factories/make-category'

describe('GetAllCategoriesRoute', () => {
	let useCase: GetAllCategoriesUseCase
	let route: GetAllCategoriesRoute

	beforeEach(() => {
		useCase = mock(GetAllCategoriesUseCase)
		route = new GetAllCategoriesRoute({
			getAllCategoriesUseCase: instance(useCase),
		})
	})

	it('GET /all → 200 with categories', async () => {
		const categories = await Promise.all([
			makeCategory({ name: 'Dev', slug: 'dev' }),
			makeCategory({ name: 'Design', slug: 'design' }),
		])
		when(useCase.execute()).thenResolve(success({ categories }))

		const res = await req(route.getRoute(), '/all')

		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body).toBeArray()
		expect(body).toHaveLength(2)
	})

	it('GET /all → 200 with empty array when no categories', async () => {
		when(useCase.execute()).thenResolve(success({ categories: [] }))

		const res = await req(route.getRoute(), '/all')

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual([])
	})
})
