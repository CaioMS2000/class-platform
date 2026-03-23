import { describe, it, expect, beforeEach } from 'bun:test'
import { drizzle } from '@/lib/drizzle'
import { DrizzleOAuthStateRepository } from './drizzle-oauth-state-repository'
import { oauthStates } from '../schema'
import { makeOAuthStateData } from '@/modules/auth-and-users/test/factories/make-oauth-state'

describe('DrizzleOAuthStateRepository', () => {
	const repo = new DrizzleOAuthStateRepository()

	beforeEach(async () => {
		await drizzle.delete(oauthStates)
	})

	describe('save', () => {
		it('should persist an oauth state', async () => {
			const { state, data, expiresInSeconds } = makeOAuthStateData()

			await repo.save(state, data, expiresInSeconds)

			const found = await repo.findAndDelete(state)
			expect(found).not.toBeNull()
			expect(found!.codeVerifier).toBe(data.codeVerifier)
			expect(found!.provider).toBe(data.provider)
		})
	})

	describe('findAndDelete', () => {
		it('should return state data and delete the record', async () => {
			const { state, data, expiresInSeconds } = makeOAuthStateData()
			await repo.save(state, data, expiresInSeconds)

			const found = await repo.findAndDelete(state)

			expect(found).not.toBeNull()
			expect(found!.codeVerifier).toBe(data.codeVerifier)
			expect(found!.provider).toBe(data.provider)

			// Should be deleted after findAndDelete
			const foundAgain = await repo.findAndDelete(state)
			expect(foundAgain).toBeNull()
		})

		it('should return null when state does not exist', async () => {
			const found = await repo.findAndDelete('non-existent-state')

			expect(found).toBeNull()
		})

		it('should return null when state is expired', async () => {
			const { state, data } = makeOAuthStateData()

			// Save with 0 seconds expiry so it is already expired
			await repo.save(state, data, 0)

			const found = await repo.findAndDelete(state)
			expect(found).toBeNull()
		})
	})
})
