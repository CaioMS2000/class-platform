import { Elysia } from 'elysia'
import { Value } from '@sinclair/typebox/value'
import type { HTTPUser } from '@repo/shared/types/http-user'
import { httpUserSchema } from '../validators/user'
import { setup } from '../setup'

export const authPlugin = new Elysia({ name: 'auth' })
	.use(setup)
	.derive({ as: 'scoped' }, async ({ headers, jwtService }) => {
		const token = headers.authorization?.replace('Bearer ', '')
		if (!token) throw new Error('Unauthorized')

		const payload = await jwtService.verify(token)
		if (!Value.Check(httpUserSchema, payload)) throw new Error('Unauthorized')

		return { user: payload as HTTPUser }
	})
	.onError({ as: 'scoped' }, ({ error, set }) => {
		if (error instanceof Error && error.message === 'Unauthorized') {
			set.status = 401
			return { error: 'Unauthorized' }
		}
	})
