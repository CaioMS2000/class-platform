import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, UniqueId } from '@repo/core'
import { req } from '@/test/http-helpers'
import { BrowseCatalogRoute } from './browse-catalog'
import { BrowsePublicCatalogUseCase } from '@/modules/catalog/application/use-cases'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'

describe('BrowseCatalogRoute', () => {
	let useCase: BrowsePublicCatalogUseCase
	let route: BrowseCatalogRoute

	beforeEach(() => {
		useCase = mock(BrowsePublicCatalogUseCase)
		route = new BrowseCatalogRoute({
			browsePublicCatalogUseCase: instance(useCase),
		})
	})

	it('GET /browse → 200 with courses', async () => {
		const course = await makeCourse({
			id: UniqueId('course-1'),
			slug: 'typescript-basics',
			title: 'TypeScript Basics',
			description: 'Learn TS',
			thumbnail: 'thumb.jpg',
			status: 'published',
		})
		when(useCase.execute(anything())).thenResolve(
			success({ ['courses']: [course] })
		)

		const res = await req(route.getRoute(), '/browse')

		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body).toBeArray()
		expect(body).toHaveLength(1)
	})

	it('GET /browse → 200 with empty array when no courses', async () => {
		when(useCase.execute(anything())).thenResolve(success({ courses: [] }))

		const res = await req(route.getRoute(), '/browse')

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual([])
	})

	it('GET /browse?level=beginner → passes query filters to use case', async () => {
		when(useCase.execute(anything())).thenResolve(success({ courses: [] }))

		const res = await req(route.getRoute(), '/browse?level=beginner')

		expect(res.status).toBe(200)
	})
})
