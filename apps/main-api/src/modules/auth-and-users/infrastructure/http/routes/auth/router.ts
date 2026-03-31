import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import type {
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUseCase,
	SocialLoginUseCase,
} from '@/modules/auth-and-users/domain/application/use-cases'
import type { OAuthStateRepository } from '@/modules/auth-and-users/domain/application/repositories/oauth-state-repository'
import type { OAuthProviderService } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { BASE_URL } from '@/http/constants'
import { LoginRoute } from './login'
import { SignUpRoute } from './sign-up'
import { SocialLoginInitiateRoute } from './social-login-initiate'
import { SocialLoginCallbackRoute } from './social-login-callback'
import { RefreshTokenRoute } from './refresh-token'
import { LogoutRoute } from './logout'

type AuthRouterProps = {
	loginUseCase: LoginUseCase
	registerUseCase: RegisterUseCase
	socialLoginUseCase: SocialLoginUseCase
	refreshTokenUseCase: RefreshTokenUseCase
	logoutUseCase: LogoutUseCase
	oauthProviderService: OAuthProviderService
	oauthStateRepository: OAuthStateRepository
}

export class AuthRouter extends Class<AuthRouterProps> {
	constructor(protected override props: AuthRouterProps) {
		super()
	}

	private readonly BASE_URL = `${BASE_URL}/auth`
	private get Elysia() {
		return new Elysia({ prefix: this.BASE_URL })
	}

	getRouter() {
		const login = new LoginRoute({
			loginUseCase: this.props.loginUseCase,
		})
		const signUp = new SignUpRoute({
			registerUseCase: this.props.registerUseCase,
		})
		const socialLoginInitiate = new SocialLoginInitiateRoute({
			oauthProviderService: this.props.oauthProviderService,
			oauthStateRepository: this.props.oauthStateRepository,
		})
		const socialLoginCallback = new SocialLoginCallbackRoute({
			socialLoginUseCase: this.props.socialLoginUseCase,
			oauthProviderService: this.props.oauthProviderService,
			oauthStateRepository: this.props.oauthStateRepository,
		})
		const refreshToken = new RefreshTokenRoute({
			refreshTokenUseCase: this.props.refreshTokenUseCase,
		})
		const logout = new LogoutRoute({
			logoutUseCase: this.props.logoutUseCase,
		})

		return this.Elysia.use(login.getRoute())
			.use(signUp.getRoute())
			.use(socialLoginInitiate.getRoute())
			.use(socialLoginCallback.getRoute())
			.use(refreshToken.getRoute())
			.use(logout.getRoute())
	}
}
