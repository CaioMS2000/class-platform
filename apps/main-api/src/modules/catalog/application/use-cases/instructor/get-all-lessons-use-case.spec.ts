import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { InstructorGetAllLessonsUseCase } from './get-all-lessons-use-case'
import { LessonRepository } from '../../repositories/lesson-repository'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { ModuleNotFoundError, NotCourseOwnerError } from '../../@errors'
import { Lesson } from '../../../domain/entities/lesson'
import { Module } from '../../../domain/entities/module'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorGetAllLessonsUseCase', () => {
	let lessonRepo: LessonRepository
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: InstructorGetAllLessonsUseCase

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new InstructorGetAllLessonsUseCase({
			lessonRepository: instance(lessonRepo),
			moduleRepository: instance(moduleRepo),
			courseRepository: instance(courseRepo),
		})
	})

	it('should return failure when module is not found', async () => {
		when(moduleRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			moduleId: 'non-existent-id',
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(ModuleNotFoundError)
	})

	it('should return failure when instructor is not the course owner', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: { courseId: UniqueId('course-id'), title: 'Module 1', order: 1 },
		})
		const mockCourse: any = { instructorId: UniqueId('other-instructor') }

		when(moduleRepo.findById(anything())).thenResolve(module)
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const result = await sut.execute({
			moduleId: module.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(NotCourseOwnerError)
	})

	it('should return success with lessons', async () => {
		const module = await Module.create({
			idGenerator: new FakeIdGenerator(),
			input: { courseId: UniqueId('course-id'), title: 'Module 1', order: 1 },
		})
		const mockCourse: any = { instructorId: UniqueId('instructor-123') }
		const lesson1 = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				moduleId: module.id,
				courseId: UniqueId('course-id'),
				order: 1,
				title: 'Lesson 1',
				type: 'video',
				content: { videoUrl: 'https://example.com/1.mp4' },
				duration: 5,
				isFree: true,
			},
		})
		const lesson2 = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				moduleId: module.id,
				courseId: UniqueId('course-id'),
				order: 2,
				title: 'Lesson 2',
				type: 'video',
				content: { videoUrl: 'https://example.com/2.mp4' },
				duration: 8,
				isFree: false,
			},
		})

		when(moduleRepo.findById(anything())).thenResolve(module)
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(lessonRepo.findManyByModuleId(anything())).thenResolve([
			lesson1,
			lesson2,
		])

		const result = await sut.execute({
			moduleId: module.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.lessons).toHaveLength(2)
		}
	})
})
