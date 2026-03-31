import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { UniqueId } from '@repo/core'
import { drizzle } from '@/lib/drizzle'
import { students } from '@/modules/auth-and-users/infrastructure/database/schema'
import { DrizzleStudentRepository } from './drizzle-student-repository'
import { DrizzleStudentRepository as AuthDrizzleStudentRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-student-repository'
import { makeStudent } from '@/modules/auth-and-users/test/factories/make-student'

describe('DrizzleStudentRepository (learning)', () => {
	const repo = new DrizzleStudentRepository()
	const authStudentRepo = new AuthDrizzleStudentRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(students)
	})

	async function createStudentInDb() {
		const student = await makeStudent()
		await authStudentRepo.save(student)
		return student
	}

	describe('findById', () => {
		it('should return student when found', async () => {
			const student = await createStudentInDb()
			const found = await repo.findById(student.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(student.id)
			expect(found!.email).toBe(student.email)
			expect(found!.name).toBe(student.name)
		})

		it('should return null when not found', async () => {
			const result = await repo.findById(UniqueId('non-existent'))
			expect(result).toBeNull()
		})
	})

	describe('save (update)', () => {
		it('should update student fields', async () => {
			const student = await createStudentInDb()

			const learningStudent = await repo.findById(student.id)
			expect(learningStudent).not.toBeNull()

			const updated = learningStudent!.update({ name: 'Updated Name' })
			await repo.save(updated)

			const found = await repo.findById(student.id)
			expect(found).not.toBeNull()
			expect(found!.name).toBe('Updated Name')
		})
	})
})
