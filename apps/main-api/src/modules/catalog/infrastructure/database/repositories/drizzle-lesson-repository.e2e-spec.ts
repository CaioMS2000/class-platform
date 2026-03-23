import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { drizzle } from '@/lib/drizzle'
import { DrizzleLessonRepository } from './drizzle-lesson-repository'
import { DrizzleModuleRepository } from './drizzle-module-repository'
import { DrizzleCourseRepository } from './drizzle-course-repository'
import { DrizzleInstructorRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { lessons, courseModules, courses } from '../schema'
import { instructors } from '@/modules/auth-and-users/infrastructure/database/schema'
import { makeLesson } from '@/modules/catalog/test/factories/make-lesson'
import { makeModule } from '@/modules/catalog/test/factories/make-module'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'

describe('DrizzleLessonRepository', () => {
	const repo = new DrizzleLessonRepository()
	const moduleRepo = new DrizzleModuleRepository()
	const courseRepo = new DrizzleCourseRepository()
	const instructorRepo = new DrizzleInstructorRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(lessons)
		await drizzle.delete(courseModules)
		await drizzle.delete(courses)
		await drizzle.delete(instructors)
	})

	async function createParentsAndLesson(
		lessonOverrides: Parameters<typeof makeLesson>[0] = {}
	) {
		const instructor = await makeInstructor()
		await instructorRepo.save(instructor)
		const course = await makeCourse({ instructorId: instructor.id })
		await courseRepo.save(course)
		const module = await makeModule({ courseId: course.id })
		await moduleRepo.save(module)
		const lesson = await makeLesson({
			moduleId: module.id,
			courseId: course.id,
			...lessonOverrides,
		})
		return { instructor, course, module, lesson }
	}

	describe('save', () => {
		it('should persist a lesson', async () => {
			const { lesson } = await createParentsAndLesson()

			await repo.save(lesson)

			const found = await repo.findById(lesson.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(lesson.id)
			expect(found!.title).toBe(lesson.title)
			expect(found!.moduleId).toBe(lesson.moduleId)
			expect(found!.courseId).toBe(lesson.courseId)
			expect(found!.type).toBe(lesson.type)
			expect(found!.duration).toBe(lesson.duration)
		})
	})

	describe('update', () => {
		it('should update an existing lesson', async () => {
			const { lesson } = await createParentsAndLesson()
			await repo.save(lesson)

			const updated = lesson.update({ title: 'Updated Lesson Title' })
			await repo.update(updated)

			const found = await repo.findById(lesson.id)
			expect(found).not.toBeNull()
			expect(found!.title).toBe('Updated Lesson Title')
		})
	})

	describe('delete', () => {
		it('should remove a lesson', async () => {
			const { lesson } = await createParentsAndLesson()
			await repo.save(lesson)

			await repo.delete(lesson)

			const found = await repo.findById(lesson.id)
			expect(found).toBeNull()
		})
	})

	describe('findById', () => {
		it('should return a lesson when it exists', async () => {
			const { lesson } = await createParentsAndLesson()
			await repo.save(lesson)

			const found = await repo.findById(lesson.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(lesson.id)
		})

		it('should return null when lesson does not exist', async () => {
			const found = await repo.findById('non-existent-id')
			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return a lesson when it exists', async () => {
			const { lesson } = await createParentsAndLesson()
			await repo.save(lesson)

			const found = await repo.getById(lesson.id)

			expect(found.id).toBe(lesson.id)
		})

		it('should throw when lesson does not exist', async () => {
			expect(async () => {
				await repo.getById('non-existent-id')
			}).toThrow()
		})
	})

	describe('findManyByModuleId', () => {
		it('should return all lessons for a given module', async () => {
			const { module, course } = await createParentsAndLesson()
			const lesson1 = await makeLesson({
				moduleId: module.id,
				courseId: course.id,
				order: 1,
			})
			const lesson2 = await makeLesson({
				moduleId: module.id,
				courseId: course.id,
				order: 2,
			})
			await repo.save(lesson1)
			await repo.save(lesson2)

			const result = await repo.findManyByModuleId(module.id)

			expect(result).toHaveLength(2)
		})

		it('should return an empty array when no lessons exist for the module', async () => {
			const result = await repo.findManyByModuleId('non-existent-module-id')
			expect(result).toHaveLength(0)
		})

		it('should not return lessons from other modules', async () => {
			const instructor = await makeInstructor()
			await instructorRepo.save(instructor)
			const course = await makeCourse({ instructorId: instructor.id })
			await courseRepo.save(course)

			const module1 = await makeModule({ courseId: course.id, order: 1 })
			const module2 = await makeModule({ courseId: course.id, order: 2 })
			await moduleRepo.save(module1)
			await moduleRepo.save(module2)

			const lesson1 = await makeLesson({
				moduleId: module1.id,
				courseId: course.id,
				order: 1,
			})
			const lesson2 = await makeLesson({
				moduleId: module2.id,
				courseId: course.id,
				order: 1,
			})
			await repo.save(lesson1)
			await repo.save(lesson2)

			const result = await repo.findManyByModuleId(module1.id)

			expect(result).toHaveLength(1)
			expect(result[0].moduleId).toBe(module1.id)
		})
	})

	describe('findManyByCourseId', () => {
		it('should return all lessons for a given course', async () => {
			const { module, course } = await createParentsAndLesson()
			const lesson1 = await makeLesson({
				moduleId: module.id,
				courseId: course.id,
				order: 1,
			})
			const lesson2 = await makeLesson({
				moduleId: module.id,
				courseId: course.id,
				order: 2,
			})
			await repo.save(lesson1)
			await repo.save(lesson2)

			const result = await repo.findManyByCourseId(course.id)

			expect(result).toHaveLength(2)
		})

		it('should return an empty array when no lessons exist for the course', async () => {
			const result = await repo.findManyByCourseId('non-existent-course-id')
			expect(result).toHaveLength(0)
		})

		it('should not return lessons from other courses', async () => {
			const instructor = await makeInstructor()
			await instructorRepo.save(instructor)

			const course1 = await makeCourse({ instructorId: instructor.id })
			const course2 = await makeCourse({ instructorId: instructor.id })
			await courseRepo.save(course1)
			await courseRepo.save(course2)

			const module1 = await makeModule({ courseId: course1.id, order: 1 })
			const module2 = await makeModule({ courseId: course2.id, order: 1 })
			await moduleRepo.save(module1)
			await moduleRepo.save(module2)

			const lesson1 = await makeLesson({
				moduleId: module1.id,
				courseId: course1.id,
				order: 1,
			})
			const lesson2 = await makeLesson({
				moduleId: module2.id,
				courseId: course2.id,
				order: 1,
			})
			await repo.save(lesson1)
			await repo.save(lesson2)

			const result = await repo.findManyByCourseId(course1.id)

			expect(result).toHaveLength(1)
			expect(result[0].courseId).toBe(course1.id)
		})
	})
})
