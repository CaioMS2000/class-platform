import { describe, it, expect, beforeEach } from 'bun:test'
import { drizzle } from '@/lib/drizzle'
import { DrizzleOAuthAccountRepository } from './drizzle-oauth-account-repository'
import { DrizzleStudentRepository } from './drizzle-student-repository'
import { oauthAccounts, students } from '../schema'
import { makeOAuthAccountData } from '@/modules/auth-and-users/test/factories/make-oauth-account'
import { makeStudent } from '@/modules/auth-and-users/test/factories/make-student'

describe('DrizzleOAuthAccountRepository', () => {
	const repo = new DrizzleOAuthAccountRepository()
	const studentRepo = new DrizzleStudentRepository()

	beforeEach(async () => {
		await drizzle.delete(oauthAccounts)
		await drizzle.delete(students)
	})

	async function createStudentAndAccountData(
		overrides: Parameters<typeof makeOAuthAccountData>[0] = {}
	) {
		const student = await makeStudent()
		await studentRepo.save(student)
		const data = makeOAuthAccountData({
			userId: student.id,
			...overrides,
		})
		return { student, data }
	}

	describe('save', () => {
		it('should persist an oauth account and return its id', async () => {
			const { data } = await createStudentAndAccountData()

			const result = await repo.save(data)

			expect(result.id).toBeDefined()
			expect(typeof result.id).toBe('string')
		})
	})

	describe('findByProviderAndAccountId', () => {
		it('should return an oauth account by provider and account id', async () => {
			const { student, data } = await createStudentAndAccountData({
				provider: 'google',
				providerAccountId: 'google-123',
			})
			await repo.save(data)

			const found = await repo.findByProviderAndAccountId(
				'google',
				'google-123'
			)

			expect(found).not.toBeNull()
			expect(found!.userId).toBe(student.id)
			expect(found!.provider).toBe('google')
			expect(found!.providerAccountId).toBe('google-123')
		})

		it('should return null when provider and account id do not match', async () => {
			const found = await repo.findByProviderAndAccountId(
				'github',
				'non-existent'
			)

			expect(found).toBeNull()
		})

		it('should distinguish between different providers with the same account id', async () => {
			const { data: googleData } = await createStudentAndAccountData({
				provider: 'google',
				providerAccountId: 'same-id',
			})
			const { data: githubData } = await createStudentAndAccountData({
				provider: 'github',
				providerAccountId: 'same-id',
			})
			await repo.save(googleData)
			await repo.save(githubData)

			const google = await repo.findByProviderAndAccountId('google', 'same-id')
			const github = await repo.findByProviderAndAccountId('github', 'same-id')

			expect(google).not.toBeNull()
			expect(github).not.toBeNull()
			expect(google!.userId).not.toBe(github!.userId)
		})
	})
})
