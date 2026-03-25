import { createContainer, InjectionMode, type AwilixContainer } from 'awilix'
import type {
	JwtService,
	JwtTokenGenerator,
} from './modules/auth-and-users/domain/application/jwt'
import type { AdminHttpController } from './modules/auth-and-users/infrastructure/http/controllers/admin-controller'
import type { AdminRepository } from './modules/auth-and-users/domain/application/repositories/admin-repository'

interface CradleInterface {
	jwtService: JwtService
	jwtTokenGenerator: JwtTokenGenerator
	adminHttpController: AdminHttpController
	adminRepository: AdminRepository
	// x: X
}

const _container = createContainer({
	injectionMode: InjectionMode.PROXY,
})

declare global {
	const container: AwilixContainer<CradleInterface>
}

Object.assign(globalThis, {
	container: _container,
})
