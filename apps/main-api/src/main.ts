import '../global'
import './container'
import {initHttpServer} from './http/server'
import { UUIDV7Generator } from '@repo/core'
import {
	GetAdminUseCase,
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUseCase,
	SocialLoginUseCase,
} from './modules/auth-and-users/domain/application/use-cases'
import { OAuthProviderService } from './modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { PasswordService } from './modules/auth-and-users/infrastructure/auth/password-service'
import { TokenService } from './modules/auth-and-users/infrastructure/auth/token-service'
import { DrizzleAdminRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-admin-repository'
import { DrizzleInstructorRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { DrizzleOAuthAccountRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-oauth-account-repository'
import { DrizzleOAuthStateRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-oauth-state-repository'
import { DrizzleRefreshTokenRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-refresh-token-repository'
import { DrizzleStudentRepository as AuthModuleDrizzleStudentRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-student-repository'
import { AdminHttpController } from './modules/auth-and-users/infrastructure/http/controllers/admin-controller'
import { AuthHttpController } from './modules/auth-and-users/infrastructure/http/controllers/auth-controller'
import { GetAllCategoriesUseCase } from './modules/catalog/application/use-cases'
import { DrizzleCategoryRepository } from './modules/catalog/infrastructure/database/repositories/drizzle-category-repository'
import { CategoryHttpController } from './modules/catalog/infrastructure/http/controllers/categories-controller'
import { env } from './config/env'

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
	oauthStateRepository: container
		.asFunction(() => new DrizzleOAuthStateRepository())
		.singleton(),
	oauthAccountRepository: container
		.asFunction(() => new DrizzleOAuthAccountRepository())
		.singleton(),

	// catalog repositories
	categoryRepository: container
		.asFunction(() => new DrizzleCategoryRepository())
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
	socialLoginUseCase: container
		.asFunction(
			({
				adminRepository,
				instructorRepository,
				authStudentRepository,
				oauthAccountRepository,
				refreshTokenRepository,
				jwtService,
				tokenGenerator,
				idGenerator,
			}) =>
				new SocialLoginUseCase({
					adminRepository,
					instructorRepository,
					studentRepository: authStudentRepository,
					oauthAccountRepository,
					refreshTokenRepository,
					jwtService,
					tokenGenerator,
					idGenerator,
				})
		)
		.singleton(),
	refreshTokenUseCase: container
		.asFunction(
			({
				refreshTokenRepository,
				adminRepository,
				instructorRepository,
				authStudentRepository,
				jwtService,
				tokenGenerator,
			}) =>
				new RefreshTokenUseCase({
					refreshTokenRepository,
					adminRepository,
					instructorRepository,
					studentRepository: authStudentRepository,
					jwtService,
					tokenGenerator,
				})
		)
		.singleton(),
	logoutUseCase: container
		.asFunction(
			({ refreshTokenRepository, tokenGenerator }) =>
				new LogoutUseCase({ refreshTokenRepository, tokenGenerator })
		)
		.singleton(),

	// catalog use cases
	getAllCategoriesUseCase: container
		.asFunction(
			({ categoryRepository }) =>
				new GetAllCategoriesUseCase({ categoryRepository })
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
	oauthProviderService: container
		.asFunction(
			() =>
				new OAuthProviderService({
					googleClientId: env.GOOGLE_CLIENT_ID,
					googleClientSecret: env.GOOGLE_CLIENT_SECRET,
					googleRedirectUri: env.GOOGLE_REDIRECT_URI,
				})
		)
		.singleton(),
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
			({
				loginUseCase,
				registerUseCase,
				socialLoginUseCase,
				refreshTokenUseCase,
				logoutUseCase,
				oauthProviderService,
				oauthStateRepository,
			}) =>
				new AuthHttpController({
					loginUseCase,
					registerUseCase,
					socialLoginUseCase,
					refreshTokenUseCase,
					logoutUseCase,
					oauthProviderService,
					oauthStateRepository,
				})
		)
		.singleton(),
	categoryHttpController: container
		.asFunction(
			({ getAllCategoriesUseCase }) =>
				new CategoryHttpController({ getAllCategoriesUseCase })
		)
		.singleton(),
})

// Start HTTP server
// await import('./http/server')
initHttpServer()
