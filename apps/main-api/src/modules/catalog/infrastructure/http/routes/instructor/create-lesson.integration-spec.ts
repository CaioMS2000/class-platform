import { describe, it, expect, beforeEach } from 'bun:test'
import { mock, instance, when, anything } from '@johanblumenberg/ts-mockito'
import { success, failure } from '@repo/core'
import { jsonReq } from '@/test/http-helpers'
import { CreateLessonRoute } from './create-lesson'
import { InstructorCreateLessonUseCase } from '@/modules/catalog/application/use-cases'
import {
	CourseNotFoundError,
	ModuleNotFoundError,
	NotCourseOwnerError,
} from '@/modules/catalog/application/@errors'
import { makeLesson } from '@/modules/catalog/test/factories/make-lesson'

const validBody = {
	courseId: 'course-1',
	moduleId: 'module-1',
	instructorId: 'instructor-1',
	title: 'Introdução ao TypeScript',
	order: 1,
	type: 'video',
	content: { videoUrl: 'https://example.com/video.mp4' },
	duration: 10,
	isFree: false,
}

describe('CreateLessonRoute', () => {
	let useCase: InstructorCreateLessonUseCase
	let route: CreateLessonRoute

	beforeEach(() => {
		useCase = mock(InstructorCreateLessonUseCase)
		route = new CreateLessonRoute({
			createLessonUseCase: instance(useCase),
		})
	})

	it('POST /new-lesson → 201 with created lesson', async () => {
		const lesson = await makeLesson({ title: 'Introdução ao TypeScript' })
		when(useCase.execute(anything())).thenResolve(success({ lesson }))

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-lesson',
			validBody
		)

		expect(res.status).toBe(201)
	})

	it('POST /new-lesson → 404 when course not found', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new CourseNotFoundError())
		)

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-lesson',
			validBody
		)

		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})

	it('POST /new-lesson → 404 when module not found', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new ModuleNotFoundError())
		)

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-lesson',
			validBody
		)

		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})

	it('POST /new-lesson → 403 when instructor is not course owner', async () => {
		when(useCase.execute(anything())).thenResolve(
			failure(new NotCourseOwnerError())
		)

		const res = await jsonReq(
			route.getRoute(),
			'POST',
			'/new-lesson',
			validBody
		)

		expect(res.status).toBe(403)
		const body = await res.json()
		expect(body).toHaveProperty('error')
	})
})
