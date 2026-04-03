import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure, InvalidValueError } from '@repo/core'
import { jsonReq } from '@/test/http-helpers'
import { CreateCourseRoute } from './create-course'
import { InstructorCreateCourseUseCase } from '@/modules/catalog/application/use-cases'
import { CategoryNotFoundError } from '@/modules/catalog/application/@errors'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'

const validBody = {
	instructorId: 'instructor-1',
	title: 'TypeScript Avancado',
	description: 'Aprenda TypeScript do zero ao avancado',
	price: { amount: 9900, currency: 'BRL' },
	level: 'beginner',
	thumbnail: 'https://example.com/thumb.jpg',
}

describe('CreateCourseRoute', () => {
	let useCase: InstructorCreateCourseUseCase
	let route: CreateCourseRoute

	beforeEach(() => {
		useCase = mock(InstructorCreateCourseUseCase)
		route = new CreateCourseRoute({
			createCourseUseCase: instance(useCase),
		})
	})

	it('POST / → 201 with created course', async () => {
		const course = await makeCourse({ title: 'TypeScript Avancado' })
		when(useCase.execute(anything())).thenResolve(success({ course }))

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-course',
			validBody
		)

		expect(res.status).toBe(201)
	})

	it('POST / → 404 when category not found', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new CategoryNotFoundError())
		)

		const res = await jsonReq(route.getRoute(), 'POST', '/new-course', {
			...validBody,
			categoryIds: ['nonexistent-category'],
		})

		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})

	it('POST / → 422 when price is invalid', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new InvalidValueError('Invalid price'))
		)

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-course',
			validBody
		)

		expect(res.status).toBe(422)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})

	it('POST / → 201 with optional fields', async () => {
		const course = await makeCourse({
			title: 'TypeScript Avancado',
			subtitle: 'Subtitulo do curso',
		})
		when(useCase.execute(anything())).thenResolve(success({ course }))

		const res = await jsonReq(route.getRoute(), 'POST', '/new-course', {
			...validBody,
			subtitle: 'Subtitulo do curso',
			promotionalPrice: { amount: 4900, currency: 'BRL' },
			categoryIds: ['cat-1'],
		})

		expect(res.status).toBe(201)
	})
})
