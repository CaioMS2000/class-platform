import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { jsonReq } from '@/test/http-helpers'
import { CreateModuleRoute } from './create-module'
import { InstructorCreateModuleUseCase } from '@/modules/catalog/application/use-cases'
import {
	CourseNotFoundError,
	NotCourseOwnerError,
} from '@/modules/catalog/application/@errors'
import { makeModule } from '@/modules/catalog/test/factories/make-module'

const validBody = {
	courseId: 'course-1',
	instructorId: 'instructor-1',
	title: 'Módulo 1: Fundamentos',
	order: 1,
}

describe('CreateModuleRoute', () => {
	let useCase: InstructorCreateModuleUseCase
	let route: CreateModuleRoute

	beforeEach(() => {
		useCase = mock(InstructorCreateModuleUseCase)
		route = new CreateModuleRoute({
			createModuleUseCase: instance(useCase),
		})
	})

	it('POST /new-module → 201 with created module', async () => {
		const module = await makeModule({ title: 'Módulo 1: Fundamentos' })
		when(useCase.execute(anything())).thenResolve(success({ module }))

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-module',
			validBody
		)

		expect(res.status).toBe(201)
	})

	it('POST /new-module → 404 when course not found', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new CourseNotFoundError())
		)

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-module',
			validBody
		)

		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})

	it('POST /new-module → 403 when instructor is not course owner', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new NotCourseOwnerError())
		)

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-module',
			validBody
		)

		expect(res.status).toBe(403)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
