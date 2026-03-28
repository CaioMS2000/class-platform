import { Class } from '@repo/core'
import { routeSchemas as loginRouteSchemas } from '@repo/shared/http/schemas/typebox/auth/login'
import { routeSchemas as registerRouteSchemas } from '@repo/shared/http/schemas/typebox/auth/register'
import { Elysia, status } from 'elysia'
import type {
	LoginUseCase,
	RegisterUseCase,
} from '@/modules/auth-and-users/domain/application/use-cases'
import { BASE_URL } from '../constants'
import { Type } from '@sinclair/typebox'

type AuthHttpControllerProps = {
	loginUseCase: LoginUseCase
	registerUseCase: RegisterUseCase
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
					maxAge: 60 * 60 * 24 * 7,
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
}
