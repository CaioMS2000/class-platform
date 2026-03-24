import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { UniqueId } from '@repo/core'
import { drizzle } from '@/lib/drizzle'
import { DrizzleModuleRepository } from './drizzle-module-repository'
import { DrizzleCourseRepository } from './drizzle-course-repository'
import { DrizzleInstructorRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { courseModules, courses } from '../schema'
import { instructors } from '@/modules/auth-and-users/infrastructure/database/schema'
import { makeModule } from '@/modules/catalog/test/factories/make-module'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'

describe('DrizzleModuleRepository', () => {
	const repo = new DrizzleModuleRepository()
	const courseRepo = new DrizzleCourseRepository()
	const instructorRepo = new DrizzleInstructorRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(courseModules)
		await drizzle.delete(courses)
		await drizzle.delete(instructors)
	})

	async function createParentsAndModule(
		moduleOverrides: Parameters<typeof makeModule>[0] = {}
	) {
		const instructor = await makeInstructor()
		await instructorRepo.save(instructor)
		const course = await makeCourse({ instructorId: instructor.id })
		await courseRepo.save(course)
		const module = await makeModule({
			courseId: course.id,
			...moduleOverrides,
		})
		return { instructor, course, module }
	}

	describe('save', () => {
		it('should persist a module', async () => {
			const { module } = await createParentsAndModule()

			await repo.save(module)

			const found = await repo.findById(module.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(module.id)
			expect(found!.title).toBe(module.title)
			expect(found!.courseId).toBe(module.courseId)
			expect(found!.order).toBe(module.order)
		})
	})

	describe('update', () => {
		it('should update an existing module', async () => {
			const { module } = await createParentsAndModule()
			await repo.save(module)

			const updated = module.update({ title: 'Updated Module Title' })
			await repo.update(updated)

			const found = await repo.findById(module.id)
			expect(found).not.toBeNull()
			expect(found!.title).toBe('Updated Module Title')
		})
	})

	describe('delete', () => {
		it('should remove a module', async () => {
			const { module } = await createParentsAndModule()
			await repo.save(module)

			await repo.delete(module)

			const found = await repo.findById(module.id)
			expect(found).toBeNull()
		})
	})

	describe('findById', () => {
		it('should return a module when it exists', async () => {
			const { module } = await createParentsAndModule()
			await repo.save(module)

			const found = await repo.findById(module.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(module.id)
		})

		it('should return null when module does not exist', async () => {
			const found = await repo.findById(UniqueId('non-existent-id'))
			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return a module when it exists', async () => {
			const { module } = await createParentsAndModule()
			await repo.save(module)

			const found = await repo.getById(module.id)

			expect(found.id).toBe(module.id)
		})

		it('should throw when module does not exist', async () => {
			expect(async () => {
				await repo.getById(UniqueId('non-existent-id'))
			}).toThrow()
		})
	})

	describe('findManyByCourseId', () => {
		it('should return all modules for a given course', async () => {
			const { course } = await createParentsAndModule()
			const module1 = await makeModule({ courseId: course.id, order: 1 })
			const module2 = await makeModule({ courseId: course.id, order: 2 })
			await repo.save(module1)
			await repo.save(module2)

			const result = await repo.findManyByCourseId(course.id)

			expect(result).toHaveLength(2)
		})

		it('should return an empty array when no modules exist for the course', async () => {
			const result = await repo.findManyByCourseId(
				UniqueId('non-existent-course-id')
			)
			expect(result).toHaveLength(0)
		})

		it('should not return modules from other courses', async () => {
			const instructor = await makeInstructor()
			await instructorRepo.save(instructor)

			const course1 = await makeCourse({ instructorId: instructor.id })
			const course2 = await makeCourse({ instructorId: instructor.id })
			await courseRepo.save(course1)
			await courseRepo.save(course2)

			const module1 = await makeModule({ courseId: course1.id, order: 1 })
			const module2 = await makeModule({ courseId: course2.id, order: 1 })
			await repo.save(module1)
			await repo.save(module2)

			const result = await repo.findManyByCourseId(course1.id)

			expect(result).toHaveLength(1)
			expect(result[0]!.courseId).toBe(course1.id)
		})
	})
})
