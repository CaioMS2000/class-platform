import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { drizzle } from '@/lib/drizzle'
import { courses } from '@/modules/catalog/infrastructure/database/schema'
import { instructors } from '@/modules/auth-and-users/infrastructure/database/schema'
import { DrizzleCourseRepository } from './drizzle-course-repository'
import { DrizzleCourseRepository as CatalogDrizzleCourseRepository } from '@/modules/catalog/infrastructure/database/repositories/drizzle-course-repository'
import { DrizzleInstructorRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'

describe('DrizzleCourseRepository (learning)', () => {
	const repo = new DrizzleCourseRepository()
	const catalogCourseRepo = new CatalogDrizzleCourseRepository()
	const instructorRepo = new DrizzleInstructorRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(courses)
		await drizzle.delete(instructors)
	})

	async function createCourseInDb() {
		const instructor = await makeInstructor()
		await instructorRepo.save(instructor)
		const course = await makeCourse({ instructorId: instructor.id })
		await catalogCourseRepo.save(course)
		return course
	}

	describe('findById', () => {
		it('should return course when found', async () => {
			const course = await createCourseInDb()
			const found = await repo.findById(course.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(course.id)
			expect(found!.title).toBe(course.title)
		})

		it('should return null when not found', async () => {
			const result = await repo.findById('non-existent')
			expect(result).toBeNull()
		})
	})

	describe('save (update)', () => {
		it('should update course fields', async () => {
			const course = await createCourseInDb()

			const learningCourse = await repo.findById(course.id)
			expect(learningCourse).not.toBeNull()

			const updated = learningCourse!.update({ title: 'Updated Title' })
			await repo.save(updated)

			const found = await repo.findById(course.id)
			expect(found).not.toBeNull()
			expect(found!.title).toBe('Updated Title')
		})
	})
})
