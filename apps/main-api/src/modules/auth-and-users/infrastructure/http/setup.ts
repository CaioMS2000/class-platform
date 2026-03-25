import { Elysia } from 'elysia'
import type { JwtService } from '@/modules/auth-and-users/domain/application/jwt'

export const setup = new Elysia({ name: 'setup' }).decorate(
	'jwtService',
	{} as JwtService
)
