import '../global'
import './container'
import { asFunction } from 'awilix'
import { UUIDV7Generator } from '@repo/core'
import {
	GetAdminUseCase,
	LoginUseCase,
	RegisterUseCase,
} from './modules/auth-and-users/domain/application/use-cases'
import { PasswordService } from './modules/auth-and-users/infrastructure/auth/password-service'
import { TokenService } from './modules/auth-and-users/infrastructure/auth/token-service'
import { DrizzleAdminRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-admin-repository'
import { DrizzleInstructorRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { DrizzleRefreshTokenRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-refresh-token-repository'
import { DrizzleStudentRepository as AuthModuleDrizzleStudentRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-student-repository'
import { AdminHttpController } from './modules/auth-and-users/infrastructure/http/controllers/admin-controller'
import { AuthHttpController } from './modules/auth-and-users/infrastructure/http/controllers/auth-controller'

// Application
// Repositories
container.register({
	adminRepository: container
		.asFunction(() => new DrizzleAdminRepository())
		.singleton(),
	instructorRepository: container
		.asFunction(() => new DrizzleInstructorRepository())
		.singleton(),
	authStudentRepository: container
		.asFunction(() => new AuthModuleDrizzleStudentRepository())
		.singleton(),

	refreshTokenRepository: container
		.asFunction(() => new DrizzleRefreshTokenRepository())
		.singleton(),
})
// Use cases
container.register({
	getAdminUseCase: container
		.asFunction(
			({ adminRepository }) => new GetAdminUseCase({ adminRepository })
		)
		.singleton(),
	loginUseCase: container
		.asFunction(
			({
				adminRepository,
				instructorRepository,
				authStudentRepository,
				hashVerifier,
				jwtService,
				tokenGenerator,
				refreshTokenRepository,
			}) =>
				new LoginUseCase({
					adminRepository,
					instructorRepository,
					studentRepository: authStudentRepository,
					hashVerifier,
					jwtService,
					tokenGenerator,
					refreshTokenRepository,
				})
		)
		.singleton(),
	registerUseCase: container
		.asFunction(
			({
				adminRepository,
				instructorRepository,
				authStudentRepository,
				hashGenerator,
				idGenerator,
			}) =>
				new RegisterUseCase({
					adminRepository,
					instructorRepository,
					studentRepository: authStudentRepository,
					hashGenerator,
					idGenerator,
				})
		)
		.singleton(),
})
// Others
container.register({
	jwtService: container.asFunction(() => new TokenService()).singleton(),
	jwtTokenGenerator: container.asFunction(() => new TokenService()).singleton(),
	hashVerifier: container.asFunction(() => new PasswordService()).singleton(),
	hashGenerator: container.asFunction(() => new PasswordService()).singleton(),
	tokenGenerator: container.asFunction(() => new TokenService()).singleton(),
	idGenerator: container.asFunction(() => new UUIDV7Generator()).singleton(),
})

// Infrastructure
container.register({
	adminHttpController: container
		.asFunction(
			({ getAdminUseCase }) => new AdminHttpController({ getAdminUseCase })
		)
		.singleton(),
	authHttpController: container
		.asFunction(
			({ loginUseCase, registerUseCase }) =>
				new AuthHttpController({ loginUseCase, registerUseCase })
		)
		.singleton(),
})
