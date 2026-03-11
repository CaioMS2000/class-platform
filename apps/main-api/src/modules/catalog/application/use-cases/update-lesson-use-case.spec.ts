import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { UpdateLessonUseCase } from './update-lesson-use-case'
import { LessonRepository } from '../repositories/lesson-repository'
import { LessonNotFoundError } from '../@errors'
import { Lesson } from '../../domain/entities/lesson'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('UpdateLessonUseCase', () => {
	let lessonRepo: LessonRepository
	let sut: UpdateLessonUseCase

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		sut = new UpdateLessonUseCase({
			lessonRepository: instance(lessonRepo),
		})
	})

	it('should return failure when lesson is not found', async () => {
		when(lessonRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			lessonId: 'non-existent-id',
			title: 'New Title',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(LessonNotFoundError)
	})

	it('should return success with updated lesson', async () => {
		const lesson = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Lesson 1',
				courseId: UniqueId('course-id'),
				moduleId: UniqueId('module-id'),
				order: 1,
				type: 'video',
				content: { videoUrl: 'url' },
				duration: 10,
				isFree: true,
			},
		})

		when(lessonRepo.findById(anything())).thenResolve(lesson)
		when(lessonRepo.update(anything())).thenResolve()

		const result = await sut.execute({
			lessonId: lesson.id.toString(),
			title: 'Advanced Lesson',
			order: 2,
			duration: 15,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.lesson.title).toBe('Advanced Lesson')
			expect(result.value.lesson.order).toBe(2)
			expect(result.value.lesson.duration).toBe(15)
		}
	})
})
