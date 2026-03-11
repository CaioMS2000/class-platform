import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { describe, expect, it, beforeEach } from 'vitest'
import { UniqueId } from '@repo/core'
import { CreateLessonUseCase } from './create-lesson-use-case'
import { LessonRepository } from '../repositories/lesson-repository'
import { ModuleRepository } from '../repositories/module-repository'
import { CourseRepository } from '../repositories/course-repository'
import { CourseNotFoundError, ModuleNotFoundError } from '../@errors'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('CreateLessonUseCase', () => {
	let lessonRepo: LessonRepository
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: CreateLessonUseCase

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new CreateLessonUseCase({
			lessonRepository: instance(lessonRepo),
			moduleRepository: instance(moduleRepo),
			courseRepository: instance(courseRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'non-existent',
			moduleId: 'module-id',
			title: 'Intro to Node',
			order: 1,
			type: 'video',
			content: { videoUrl: 'https://video.com' },
			duration: 10,
			isFree: true,
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return failure when module is not found', async () => {
		const mockCourse: any = { id: { toString: () => 'course-id' } }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			courseId: 'course-id',
			moduleId: 'non-existent',
			title: 'Intro to Node',
			order: 1,
			type: 'video',
			content: { videoUrl: 'https://video.com' },
			duration: 10,
			isFree: true,
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(ModuleNotFoundError)
	})

	it('should return success with created lesson', async () => {
		const mockCourse: any = { id: { toString: () => 'course-id' } }
		const mockModule: any = { id: { toString: () => 'module-id' } }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.findById(anything())).thenResolve(mockModule)
		when(lessonRepo.save(anything())).thenResolve()

		const result = await sut.execute({
			courseId: 'course-id',
			moduleId: 'module-id',
			title: 'Intro to Node.js',
			description: 'The very basics',
			order: 1,
			type: 'video',
			content: { videoUrl: 'https://video.com' },
			duration: 15,
			isFree: false,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { lesson } = result.value
			expect(lesson.title).toBe('Intro to Node.js')
			expect(lesson.courseId.toString()).toBe('course-id')
			expect(lesson.moduleId.toString()).toBe('module-id')
			expect(lesson.order).toBe(1)
			expect(lesson.duration).toBe(15)
		}
	})
})
