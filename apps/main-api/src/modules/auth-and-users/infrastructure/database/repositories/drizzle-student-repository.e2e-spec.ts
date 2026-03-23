import { describe, it, expect, beforeEach } from 'bun:test'
import { drizzle } from '@/lib/drizzle'
import { DrizzleStudentRepository } from './drizzle-student-repository'
import { students } from '../schema'
import { makeStudent } from '@/modules/auth-and-users/test/factories/make-student'

describe('DrizzleStudentRepository', () => {
	const repo = new DrizzleStudentRepository()

	beforeEach(async () => {
		await drizzle.delete(students)
	})

	describe('save', () => {
		it('should persist a student', async () => {
			const student = await makeStudent()

			await repo.save(student)

			const found = await repo.findById(student.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(student.id)
			expect(found!.email).toBe(student.email)
			expect(found!.name).toBe(student.name)
		})
	})

	describe('findById', () => {
		it('should return a student by id', async () => {
			const student = await makeStudent()
			await repo.save(student)

			const found = await repo.findById(student.id)

			expect(found).not.toBeNull()
			expect(found!.id).toBe(student.id)
		})

		it('should return null when student does not exist', async () => {
			const found = await repo.findById('non-existent-id')

			expect(found).toBeNull()
		})
	})

	describe('getById', () => {
		it('should return a student by id', async () => {
			const student = await makeStudent()
			await repo.save(student)

			const found = await repo.getById(student.id)

			expect(found.id).toBe(student.id)
		})

		it('should throw when student does not exist', async () => {
			expect(async () => {
				await repo.getById('non-existent-id')
			}).toThrow()
		})
	})

	describe('findByEmail', () => {
		it('should return a student by email', async () => {
			const student = await makeStudent({ email: 'student@test.com' })
			await repo.save(student)

			const found = await repo.findByEmail('student@test.com')

			expect(found).not.toBeNull()
			expect(found!.email).toBe('student@test.com')
		})

		it('should return null when email does not exist', async () => {
			const found = await repo.findByEmail('nonexistent@test.com')

			expect(found).toBeNull()
		})
	})

	describe('findMany', () => {
		it('should return all students when no filters are provided', async () => {
			const student1 = await makeStudent()
			const student2 = await makeStudent()
			await repo.save(student1)
			await repo.save(student2)

			const result = await repo.findMany()

			expect(result).toHaveLength(2)
		})

		it('should filter students by status', async () => {
			const activeStudent = await makeStudent({ status: 'active' })
			const pendingStudent = await makeStudent({ status: 'pending' })
			await repo.save(activeStudent)
			await repo.save(pendingStudent)

			const result = await repo.findMany({ status: 'active' })

			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(activeStudent.id)
		})

		it('should paginate results', async () => {
			const student1 = await makeStudent()
			const student2 = await makeStudent()
			const student3 = await makeStudent()
			await repo.save(student1)
			await repo.save(student2)
			await repo.save(student3)

			const page1 = await repo.findMany(undefined, { page: 1, limit: 2 })
			const page2 = await repo.findMany(undefined, { page: 2, limit: 2 })

			expect(page1).toHaveLength(2)
			expect(page2).toHaveLength(1)
		})
	})

	describe('update', () => {
		it('should update a student', async () => {
			const student = await makeStudent()
			await repo.save(student)

			const updated = student.update({ name: 'Updated Name' })
			await repo.update(updated)

			const found = await repo.findById(student.id)
			expect(found).not.toBeNull()
			expect(found!.name).toBe('Updated Name')
		})
	})

	describe('delete', () => {
		it('should delete a student', async () => {
			const student = await makeStudent()
			await repo.save(student)

			await repo.delete(student)

			const found = await repo.findById(student.id)
			expect(found).toBeNull()
		})
	})
})
