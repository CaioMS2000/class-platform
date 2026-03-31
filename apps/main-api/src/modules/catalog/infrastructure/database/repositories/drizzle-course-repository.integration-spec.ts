import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { UniqueId } from '@repo/core'
import { drizzle } from '@/lib/drizzle'
import { DrizzleCourseRepository } from './drizzle-course-repository'
import { DrizzleInstructorRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { courses } from '../schema'
import { instructors } from '@/modules/auth-and-users/infrastructure/database/schema'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'

describe('DrizzleCourseRepository', () => {
	const repo = new DrizzleCourseRepository()
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

	async function createInstructorAndCourse(
		courseOverrides: Parameters<typeof makeCourse>[0] = {}
	) {
		const instructor = await makeInstructor()
		await instructorRepo.save(instructor)
		const course = await makeCourse({
			instructorId: instructor.id,
			...courseOverrides,
		})
		return { instructor, course }
	}

	describe('save', () => {
		it('should persist a course', async () => {
			const { course } = await createInstructorAndCourse()

			await repo.save(course)

			const found = await repo.findById(course.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(course.id)
			expect(found!.title).toBe(course.title)
			expect(found!.slug).toBe(course.slug)
			expect(found!.price.valueInCents).toBe(course.price.valueInCents)
			expect(found!.price.currency).toBe(course.price.currency)
		})
	})

	describe('update', () => {
		it('should update an existing course', async () => {
			const { course } = await createInstructorAndCourse()
			await repo.save(course)

			const updated = course.update({ title: 'Updated Title' })
			await repo.update(updated)

			const found = await repo.findById(course.id)
			expect(found).not.toBeNull()
			expect(found!.title).toBe('Updated Title')
		})
	})

	describe('delete', () => {
		it('should remove a course', async () => {
			const { course } = await createInstructorAndCourse()
			await repo.save(course)

			await repo.delete(course)

			const found = await repo.findById(course.id)
			expect(found).toBeNull()
		})
	})

	describe('findById', () => {
		it('should return a course when it exists', async () => {
			const { course } = await createInstructorAndCourse()
			await repo.save(course)

			const found = await repo.findById(course.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(course.id)
		})

		it('should return null when course does not exist', async () => {
			const found = await repo.findById(UniqueId('non-existent-id'))
			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return a course when it exists', async () => {
			const { course } = await createInstructorAndCourse()
			await repo.save(course)

			const found = await repo.getById(course.id)

			expect(found.id).toBe(course.id)
		})

		it('should throw when course does not exist', async () => {
			expect(async () => {
				await repo.getById(UniqueId('non-existent-id'))
			}).toThrow()
		})
	})

	describe('findBySlug', () => {
		it('should return a course by its slug', async () => {
			const { course } = await createInstructorAndCourse()
			await repo.save(course)

			const found = await repo.findBySlug(course.slug)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(course.id)
			expect(found!.slug).toBe(course.slug)
		})

		it('should return null when slug does not exist', async () => {
			const found = await repo.findBySlug('non-existent-slug')
			expect(found).toBeNull()
		})
	})

	describe('findMany', () => {
		it('should return all courses', async () => {
			const { instructor } = await createInstructorAndCourse()
			const course1 = await makeCourse({ instructorId: instructor.id })
			const course2 = await makeCourse({ instructorId: instructor.id })
			await repo.save(course1)
			await repo.save(course2)

			const result = await repo.findMany()

			expect(result).toHaveLength(2)
		})

		it('should return an empty array when no courses exist', async () => {
			const result = await repo.findMany()
			expect(result).toHaveLength(0)
		})

		it('should filter by status', async () => {
			const { instructor } = await createInstructorAndCourse()
			const draft = await makeCourse({ instructorId: instructor.id })
			const published = (
				await makeCourse({ instructorId: instructor.id })
			).publish()
			await repo.save(draft)
			await repo.save(published)

			const result = await repo.findMany({ status: 'published' })

			expect(result).toHaveLength(1)
			expect(result[0]!.status).toBe('published')
		})

		it('should filter by level', async () => {
			const { instructor } = await createInstructorAndCourse()
			const beginner = await makeCourse({
				instructorId: instructor.id,
				level: 'beginner',
			})
			const advanced = await makeCourse({
				instructorId: instructor.id,
				level: 'advanced',
			})
			await repo.save(beginner)
			await repo.save(advanced)

			const result = await repo.findMany({ level: 'advanced' })

			expect(result).toHaveLength(1)
			expect(result[0]!.level).toBe('advanced')
		})

		it('should filter by instructorId', async () => {
			const instructor1 = await makeInstructor()
			const instructor2 = await makeInstructor()
			await instructorRepo.save(instructor1)
			await instructorRepo.save(instructor2)

			const course1 = await makeCourse({ instructorId: instructor1.id })
			const course2 = await makeCourse({ instructorId: instructor2.id })
			await repo.save(course1)
			await repo.save(course2)

			const result = await repo.findMany({
				instructorId: instructor1.id,
			})

			expect(result).toHaveLength(1)
			expect(result[0]!.instructorId).toBe(instructor1.id)
		})

		it('should filter by categoryId', async () => {
			const { instructor } = await createInstructorAndCourse()
			const catId = UniqueId('cat-1')
			const withCategory = await makeCourse({
				instructorId: instructor.id,
				categoriesIds: [catId],
			})
			const withoutCategory = await makeCourse({
				instructorId: instructor.id,
				categoriesIds: [],
			})
			await repo.save(withCategory)
			await repo.save(withoutCategory)

			const result = await repo.findMany({ categoryId: catId })

			expect(result).toHaveLength(1)
			expect(result[0]!.categoriesIds).toContain(catId)
		})

		it('should apply pagination', async () => {
			const { instructor } = await createInstructorAndCourse()
			for (let i = 0; i < 5; i++) {
				const course = await makeCourse({ instructorId: instructor.id })
				await repo.save(course)
			}

			const page1 = await repo.findMany(undefined, {
				limit: 2,
				page: 1,
			})
			const page2 = await repo.findMany(undefined, {
				limit: 2,
				page: 2,
			})

			expect(page1).toHaveLength(2)
			expect(page2).toHaveLength(2)
		})
	})
})
