import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { drizzle } from '@/lib/drizzle'
import { DrizzleRefreshTokenRepository } from './drizzle-refresh-token-repository'
import { DrizzleStudentRepository } from './drizzle-student-repository'
import { refreshTokens, students } from '../schema'
import { makeRefreshTokenData } from '@/modules/auth-and-users/test/factories/make-refresh-token'
import { makeStudent } from '@/modules/auth-and-users/test/factories/make-student'

describe('DrizzleRefreshTokenRepository', () => {
	const repo = new DrizzleRefreshTokenRepository()
	const studentRepo = new DrizzleStudentRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(refreshTokens)
		await drizzle.delete(students)
	})

	async function createStudentAndTokenData(
		overrides: Parameters<typeof makeRefreshTokenData>[0] = {}
	) {
		const student = await makeStudent()
		await studentRepo.save(student)
		const data = makeRefreshTokenData({
			userId: student.id,
			...overrides,
		})
		return { student, data }
	}

	describe('save', () => {
		it('should persist a refresh token', async () => {
			const { data } = await createStudentAndTokenData()

			await repo.save(
				data.userId,
				data.tokenHash,
				data.expiresInSeconds,
				data.role
			)

			const found = await repo.findByTokenHash(data.tokenHash)
			expect(found).not.toBeNull()
			expect(found!.userId).toBe(data.userId)
			expect(found!.role).toBe(data.role)
			expect(found!.used).toBe(false)
		})
	})

	describe('findByTokenHash', () => {
		it('should return token data by hash', async () => {
			const { data } = await createStudentAndTokenData({
				tokenHash: 'specific-hash',
			})
			await repo.save(
				data.userId,
				data.tokenHash,
				data.expiresInSeconds,
				data.role
			)

			const found = await repo.findByTokenHash('specific-hash')

			expect(found).not.toBeNull()
			expect(found!.userId).toBe(data.userId)
			expect(found!.used).toBe(false)
			expect(found!.role).toBe('STUDENT')
		})

		it('should return null when token hash does not exist', async () => {
			const found = await repo.findByTokenHash('non-existent-hash')

			expect(found).toBeNull()
		})
	})

	describe('revoke', () => {
		it('should delete a refresh token by hash', async () => {
			const { data } = await createStudentAndTokenData()
			await repo.save(
				data.userId,
				data.tokenHash,
				data.expiresInSeconds,
				data.role
			)

			await repo.revoke(data.tokenHash)

			const found = await repo.findByTokenHash(data.tokenHash)
			expect(found).toBeNull()
		})
	})

	describe('revokeAllForUser', () => {
		it('should delete all refresh tokens for a user', async () => {
			const { student, data } = await createStudentAndTokenData()
			const data2 = makeRefreshTokenData({ userId: student.id })

			await repo.save(
				data.userId,
				data.tokenHash,
				data.expiresInSeconds,
				data.role
			)
			await repo.save(
				data2.userId,
				data2.tokenHash,
				data2.expiresInSeconds,
				data2.role
			)

			await repo.revokeAllForUser(student.id)

			const found1 = await repo.findByTokenHash(data.tokenHash)
			const found2 = await repo.findByTokenHash(data2.tokenHash)
			expect(found1).toBeNull()
			expect(found2).toBeNull()
		})
	})

	describe('markUsed', () => {
		it('should mark a refresh token as used', async () => {
			const { data } = await createStudentAndTokenData()
			await repo.save(
				data.userId,
				data.tokenHash,
				data.expiresInSeconds,
				data.role
			)

			await repo.markUsed(data.tokenHash)

			const found = await repo.findByTokenHash(data.tokenHash)
			expect(found).not.toBeNull()
			expect(found!.used).toBe(true)
		})
	})
})
