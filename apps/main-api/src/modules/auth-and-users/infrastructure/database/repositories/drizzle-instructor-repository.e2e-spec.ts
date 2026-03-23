import { describe, it, expect, beforeEach } from 'bun:test'
import { drizzle } from '@/lib/drizzle'
import { DrizzleInstructorRepository } from './drizzle-instructor-repository'
import { instructors } from '../schema'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'

describe('DrizzleInstructorRepository', () => {
	const repo = new DrizzleInstructorRepository()

	beforeEach(async () => {
		await drizzle.delete(instructors)
	})

	describe('save', () => {
		it('should persist an instructor', async () => {
			const instructor = await makeInstructor()

			await repo.save(instructor)

			const found = await repo.findById(instructor.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(instructor.id)
			expect(found!.email).toBe(instructor.email)
			expect(found!.name).toBe(instructor.name)
		})
	})

	describe('findById', () => {
		it('should return an instructor by id', async () => {
			const instructor = await makeInstructor()
			await repo.save(instructor)

			const found = await repo.findById(instructor.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(instructor.id)
		})

		it('should return null when instructor does not exist', async () => {
			const found = await repo.findById('non-existent-id')

			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return an instructor by id', async () => {
			const instructor = await makeInstructor()
			await repo.save(instructor)

			const found = await repo.getById(instructor.id)

			expect(found.id).toBe(instructor.id)
		})

		it('should throw when instructor does not exist', async () => {
			expect(async () => {
				await repo.getById('non-existent-id')
			}).toThrow()
		})
	})

	describe('findByEmail', () => {
		it('should return an instructor by email', async () => {
			const instructor = await makeInstructor({
				email: 'instructor@test.com',
			})
			await repo.save(instructor)

			const found = await repo.findByEmail('instructor@test.com')

			expect(found).not.toBeNull()
			expect(found!.email).toBe('instructor@test.com')
		})

		it('should return null when email does not exist', async () => {
			const found = await repo.findByEmail('nonexistent@test.com')

			expect(found).toBeNull()
		})
	})

	describe('findMany', () => {
		it('should return all instructors when no filters are provided', async () => {
			const instructor1 = await makeInstructor()
			const instructor2 = await makeInstructor()
			await repo.save(instructor1)
			await repo.save(instructor2)

			const result = await repo.findMany()

			expect(result).toHaveLength(2)
		})

		it('should filter instructors by status', async () => {
			const activeInstructor = await makeInstructor({ status: 'active' })
			const pendingInstructor = await makeInstructor({ status: 'pending' })
			await repo.save(activeInstructor)
			await repo.save(pendingInstructor)

			const result = await repo.findMany({ status: 'active' })

			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(activeInstructor.id)
		})

		it('should paginate results', async () => {
			const instructor1 = await makeInstructor()
			const instructor2 = await makeInstructor()
			const instructor3 = await makeInstructor()
			await repo.save(instructor1)
			await repo.save(instructor2)
			await repo.save(instructor3)

			const page1 = await repo.findMany(undefined, { page: 1, limit: 2 })
			const page2 = await repo.findMany(undefined, { page: 2, limit: 2 })

			expect(page1).toHaveLength(2)
			expect(page2).toHaveLength(1)
		})
	})

	describe('update', () => {
		it('should update an instructor', async () => {
			const instructor = await makeInstructor()
			await repo.save(instructor)

			const updated = instructor.update({ name: 'Updated Name' })
			await repo.update(updated)

			const found = await repo.findById(instructor.id)
			expect(found).not.toBeNull()
			expect(found!.name).toBe('Updated Name')
		})
	})

	describe('delete', () => {
		it('should delete an instructor', async () => {
			const instructor = await makeInstructor()
			await repo.save(instructor)

			await repo.delete(instructor)

			const found = await repo.findById(instructor.id)
			expect(found).toBeNull()
		})
	})
})
