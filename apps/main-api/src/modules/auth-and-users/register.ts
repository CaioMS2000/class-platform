import {
	GetAdminUseCase,
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUseCase,
	SocialLoginUseCase,
} from './domain/application/use-cases'
import { OAuthProviderService } from './infrastructure/auth/oauth-provider-service'
import { DrizzleAdminRepository } from './infrastructure/database/repositories/drizzle-admin-repository'
import { DrizzleInstructorRepository } from './infrastructure/database/repositories/drizzle-instructor-repository'
import { DrizzleOAuthAccountRepository } from './infrastructure/database/repositories/drizzle-oauth-account-repository'
import { RedisOAuthStateRepository } from './infrastructure/database/repositories/redis-oauth-state-repository'
import { DrizzleRefreshTokenRepository } from './infrastructure/database/repositories/drizzle-refresh-token-repository'
import { DrizzleStudentRepository } from './infrastructure/database/repositories/drizzle-student-repository'
import { AdminHttpController } from './infrastructure/http/controllers/admin-controller'
import { AuthHttpController } from './infrastructure/http/controllers/auth-controller'
import { env } from '@/config/env'

export function registerAuthModule(c: typeof container) {
	// Repositories
	c.register({
		adminRepository: c
			.asFunction(() => new DrizzleAdminRepository())
			.singleton(),
		instructorRepository: c
			.asFunction(() => new DrizzleInstructorRepository())
			.singleton(),
		authStudentRepository: c
			.asFunction(() => new DrizzleStudentRepository())
			.singleton(),
		refreshTokenRepository: c
			.asFunction(() => new DrizzleRefreshTokenRepository())
			.singleton(),
		oauthStateRepository: c
			.asFunction(() => new RedisOAuthStateRepository())
			.singleton(),
		oauthAccountRepository: c
			.asFunction(() => new DrizzleOAuthAccountRepository())
			.singleton(),
	})

	// Use cases
	c.register({
		getAdminUseCase: c
			.asFunction(
				({ adminRepository }) => new GetAdminUseCase({ adminRepository })
			)
			.singleton(),
		loginUseCase: c
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
		registerUseCase: c
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
		socialLoginUseCase: c
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
		refreshTokenUseCase: c
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
		logoutUseCase: c
			.asFunction(
				({ refreshTokenRepository, tokenGenerator }) =>
					new LogoutUseCase({ refreshTokenRepository, tokenGenerator })
			)
			.singleton(),
	})

	// Infrastructure
	c.register({
		oauthProviderService: c
			.asFunction(
				() =>
					new OAuthProviderService({
						googleClientId: env.GOOGLE_CLIENT_ID,
						googleClientSecret: env.GOOGLE_CLIENT_SECRET,
						googleRedirectUri: env.GOOGLE_REDIRECT_URI,
					})
			)
			.singleton(),
		adminHttpController: c
			.asFunction(
				({ getAdminUseCase }) => new AdminHttpController({ getAdminUseCase })
			)
			.singleton(),
		authHttpController: c
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
	})
}
