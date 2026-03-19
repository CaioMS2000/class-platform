import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { DeleteLessonUseCase } from './delete-lesson-use-case'
import { LessonRepository } from '../../repositories/lesson-repository'
import { LessonNotFoundError } from '../../@errors'
import { Lesson } from '../../../domain/entities/lesson'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('DeleteLessonUseCase', () => {
	let lessonRepo: LessonRepository
	let sut: DeleteLessonUseCase

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		sut = new DeleteLessonUseCase({
			lessonRepository: instance(lessonRepo),
		})
	})

	it('should return failure when lesson is not found', async () => {
		when(lessonRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			lessonId: 'non-existent-id',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(LessonNotFoundError)
	})

	it('should return success and delete lesson', async () => {
		const lesson = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				title: 'Intro',
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
		when(lessonRepo.delete(anything())).thenResolve()

		const result = await sut.execute({
			lessonId: lesson.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value).toBeNull()
		}
	})
})
