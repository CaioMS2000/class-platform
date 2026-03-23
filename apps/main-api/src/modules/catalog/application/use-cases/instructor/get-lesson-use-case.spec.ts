import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito'
import { UniqueId } from '@repo/core'
import { InstructorGetLessonUseCase } from './get-lesson-use-case'
import { LessonRepository } from '../../repositories/lesson-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { LessonNotFoundError, NotCourseOwnerError } from '../../@errors'
import { Lesson } from '../../../domain/entities/lesson'
import { FakeIdGenerator } from '@/modules/catalog/test/fake-id-generator'

describe('InstructorGetLessonUseCase', () => {
	let lessonRepo: LessonRepository
	let courseRepo: CourseRepository
	let sut: InstructorGetLessonUseCase

	beforeEach(() => {
		lessonRepo = mock(LessonRepository)
		courseRepo = mock(CourseRepository)
		sut = new InstructorGetLessonUseCase({
			lessonRepository: instance(lessonRepo),
			courseRepository: instance(courseRepo),
		})
	})

	it('should return failure when lesson is not found', async () => {
		when(lessonRepo.findById(anything())).thenResolve(null)

		const result = await sut.execute({
			lessonId: 'non-existent-id',
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(LessonNotFoundError)
	})

	it('should return failure when instructor is not the course owner', async () => {
		const lesson = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				moduleId: UniqueId('module-id'),
				courseId: UniqueId('course-id'),
				order: 1,
				title: 'Intro Lesson',
				type: 'video',
				content: { videoUrl: 'https://example.com/video.mp4' },
				duration: 10,
				isFree: true,
			},
		})
		const mockCourse: any = { instructorId: UniqueId('other-instructor') }

		when(lessonRepo.findById(anything())).thenResolve(lesson)
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const result = await sut.execute({
			lessonId: lesson.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isFailure()).toBe(true)
		expect(result.value).toBeInstanceOf(NotCourseOwnerError)
	})

	it('should return success with lesson when instructor is the owner', async () => {
		const lesson = await Lesson.create({
			idGenerator: new FakeIdGenerator(),
			input: {
				moduleId: UniqueId('module-id'),
				courseId: UniqueId('course-id'),
				order: 1,
				title: 'Intro Lesson',
				type: 'video',
				content: { videoUrl: 'https://example.com/video.mp4' },
				duration: 10,
				isFree: true,
			},
		})
		const mockCourse: any = { instructorId: UniqueId('instructor-123') }

		when(lessonRepo.findById(anything())).thenResolve(lesson)
		when(courseRepo.findById(anything())).thenResolve(mockCourse)

		const result = await sut.execute({
			lessonId: lesson.id.toString(),
			instructorId: 'instructor-123',
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.lesson.id.toString()).toBe(lesson.id.toString())
		}
	})
})
