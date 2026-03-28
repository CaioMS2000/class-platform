import { Class } from '@repo/core'
import { routeSchemas as loginRouteSchemas } from '@repo/shared/http/schemas/typebox/auth/login'
import { routeSchemas as registerRouteSchemas } from '@repo/shared/http/schemas/typebox/auth/register'
import { Elysia, status } from 'elysia'
import type {
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUseCase,
	SocialLoginUseCase,
} from '@/modules/auth-and-users/domain/application/use-cases'
import type { OAuthStateRepository } from '@/modules/auth-and-users/domain/application/repositories/oauth-state-repository'
import type { OAuthProviderService } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { OAuthProvider } from '@/modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import { BASE_URL } from '../constants'
import { Type } from '@sinclair/typebox'
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '@/modules/auth-and-users/domain/application/constants'

const OAUTH_STATE_EXPIRY_SECONDS = 600 // 10 minutes

type AuthHttpControllerProps = {
	loginUseCase: LoginUseCase
	registerUseCase: RegisterUseCase
	socialLoginUseCase: SocialLoginUseCase
	refreshTokenUseCase: RefreshTokenUseCase
	logoutUseCase: LogoutUseCase
	oauthProviderService: OAuthProviderService
	oauthStateRepository: OAuthStateRepository
}

export class AuthHttpController extends Class<AuthHttpControllerProps> {
	constructor(protected override props: AuthHttpControllerProps) {
		super()
	}

	readonly tags: string[] = ['Auth']
	readonly BASE_URL = `${BASE_URL}/auth`
	readonly Elysia = new Elysia({ prefix: this.BASE_URL })

	getRouter() {
		return [
			this.registerLoginRoute(),
			this.registerSignUpRoute(),
			this.registerSocialLoginInitiateRoute(),
			this.registerSocialLoginCallbackRoute(),
			this.registerRefreshTokenRoute(),
			this.registerLogoutRoute(),
			this.Elysia,
		].filter(instance => instance instanceof Elysia)
	}

	private registerLoginRoute() {
		this.Elysia.post(
			'/login',
			async ({ body: { email, password }, cookie }) => {
				const result = await this.props.loginUseCase.execute({
					email,
					password,
				})

				if (result.isFailure())
					return status(401, { error: result.value.message })

				const { accessToken, refreshToken } = result.value

				cookie.refresh_token?.set({
					value: refreshToken,
					httpOnly: true,
					secure: true,
					sameSite: 'strict',
					maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
					path: '/',
				})

				return { access_token: accessToken }
			},
			{
				detail: { summary: 'Realizar login', tags: [...this.tags] },
				body: loginRouteSchemas.body,
				response: {
					...loginRouteSchemas.response,
					401: Type.Object({ error: Type.String() }),
				},
			}
		)
	}

	private registerSignUpRoute() {
		this.Elysia.post(
			'/register',
			async ({ body: { email, password, name, phone, role } }) => {
				const result = await this.props.registerUseCase.execute({
					email,
					password,
					name,
					phone,
					role,
				})

				if (result.isFailure())
					return status(409, { error: result.value.message })

				const { user } = result.value

				return status(201, { user: user })
			},
			{
				detail: { summary: 'Realizar cadastro', tags: [...this.tags] },
				body: registerRouteSchemas.body,
				response: {
					...registerRouteSchemas.response,
					409: Type.Object({ error: Type.String() }),
				},
			}
		)
	}

	private registerSocialLoginInitiateRoute() {
		this.Elysia.get(
			'/social/:provider',
			async ({ params: { provider }, query: { role } }) => {
				if (
					!OAuthProvider.includes(provider as (typeof OAuthProvider)[number])
				) {
					return status(400, { error: 'Provider não suportado' })
				}

				const { url, state, codeVerifier } =
					this.props.oauthProviderService.createAuthorizationURL(
						provider as (typeof OAuthProvider)[number]
					)

				await this.props.oauthStateRepository.save(
					state,
					{
						codeVerifier,
						provider,
						role: role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
					},
					OAUTH_STATE_EXPIRY_SECONDS
				)

				return new Response(null, {
					status: 302,
					headers: { Location: url.toString() },
				})
			},
			{
				detail: { summary: 'Iniciar login social', tags: [...this.tags] },
				query: Type.Object({
					role: Type.Union([
						Type.Literal('ADMIN'),
						Type.Literal('INSTRUCTOR'),
						Type.Literal('STUDENT'),
					]),
				}),
			}
		)
	}

	private registerRefreshTokenRoute() {
		this.Elysia.post(
			'/refresh',
			async ({ cookie }) => {
				const refreshToken = cookie.refresh_token?.value as string | undefined

				if (!refreshToken) {
					return status(401, { error: 'Refresh token ausente' })
				}

				const result = await this.props.refreshTokenUseCase.execute({
					refreshToken,
				})

				if (result.isFailure()) {
					cookie.refresh_token?.remove()
					return status(401, { error: result.value.message })
				}

				const { accessToken, refreshToken: newRefreshToken } = result.value

				cookie.refresh_token?.set({
					value: newRefreshToken,
					httpOnly: true,
					secure: true,
					sameSite: 'strict',
					maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
					path: '/',
				})

				return { access_token: accessToken }
			},
			{
				detail: { summary: 'Renovar access token', tags: [...this.tags] },
			}
		)
	}

	private registerLogoutRoute() {
		this.Elysia.post(
			'/logout',
			async ({ cookie }) => {
				const refreshToken = cookie.refresh_token?.value as string | undefined

				if (refreshToken) {
					await this.props.logoutUseCase.execute({ refreshToken })
				}

				cookie.refresh_token?.remove()

				return status(204)
			},
			{
				detail: { summary: 'Realizar logout', tags: [...this.tags] },
			}
		)
	}

	private registerSocialLoginCallbackRoute() {
		this.Elysia.get(
			'/social/:provider/callback',
			async ({ params: { provider }, query: { code, state }, cookie }) => {
				const stateData =
					await this.props.oauthStateRepository.findAndDelete(state)

				if (!stateData) {
					return status(400, { error: 'Estado OAuth inválido ou expirado' })
				}

				const profile =
					await this.props.oauthProviderService.validateCodeAndGetProfile(
						provider as (typeof OAuthProvider)[number],
						code,
						stateData.codeVerifier
					)

				const result = await this.props.socialLoginUseCase.execute({
					provider,
					providerAccountId: profile.providerAccountId,
					email: profile.email,
					name: profile.name,
					role: stateData.role,
				})

				const { accessToken, refreshToken } = result.value

				cookie.refresh_token?.set({
					value: refreshToken,
					httpOnly: true,
					secure: true,
					sameSite: 'strict',
					maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
					path: '/',
				})

				return { access_token: accessToken }
			},
			{
				detail: { summary: 'Callback do login social', tags: [...this.tags] },
				query: Type.Object({
					code: Type.String(),
					state: Type.String(),
				}),
			}
		)
	}
}
