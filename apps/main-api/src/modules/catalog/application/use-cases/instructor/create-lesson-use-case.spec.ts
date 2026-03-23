import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { InstructorCreateLessonUseCase } from './create-lesson-use-case'
import { LessonRepository } from '../../repositories/lesson-repository'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import {
	CourseNotFoundError,
	ModuleNotFoundError,
	NotCourseOwnerError,
} from '../../@errors'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorCreateLessonUseCase', () => {
	let lessonRepo: LessonRepository
	let moduleRepo: ModuleRepository
	let courseRepo: CourseRepository
	let sut: InstructorCreateLessonUseCase

	const baseInput = {
		moduleId: 'module-id',
		courseId: 'course-id',
		instructorId: 'instructor-123',
		order: 1,
		title: 'Intro Lesson',
		type: 'video' as const,
		content: { videoUrl: 'https://example.com/video.mp4' },
		duration: 10,
		isFree: true,
	}

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		moduleRepo = mock(ModuleRepository)
		courseRepo = mock(CourseRepository)
		sut = new InstructorCreateLessonUseCase({
			lessonRepository: instance(lessonRepo),
			moduleRepository: instance(moduleRepo),
			courseRepository: instance(courseRepo),
			idGenerator: new FakeIdGenerator(),
		})
	})

	it('should return failure when course is not found', async () => {
		when(courseRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute(baseInput)

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(CourseNotFoundError)
	})

	it('should return failure when instructor is not the course owner', async () => {
		const mockCourse: any = { instructorId: UniqueId('other-instructor') }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const result = await sut.execute(baseInput)

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(NotCourseOwnerError)
	})

	it('should return failure when module is not found', async () => {
		const mockCourse: any = { instructorId: UniqueId('instructor-123') }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute(baseInput)

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(ModuleNotFoundError)
	})

	it('should return success with created lesson', async () => {
		const mockCourse: any = { instructorId: UniqueId('instructor-123') }
		const mockModule: any = { id: { toString: () => 'module-id' } }
		when(courseRepo.findById(anything())).thenResolve(mockCourse)
		when(moduleRepo.findById(anything())).thenResolve(mockModule)
		when(lessonRepo.save(anything())).thenResolve()

		const result = await sut.execute(baseInput)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { lesson } = result.value
			expect(lesson.title).toBe('Intro Lesson')
			expect(lesson.courseId.toString()).toBe('course-id')
			expect(lesson.isFree).toBe(true)
		}
	})
})
