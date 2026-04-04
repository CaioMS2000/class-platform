import { Class } from '@repo/core'
import { routeSchemas as loginRouteSchemas } from '@repo/shared/http/schemas/typebox/auth/login'
import { Type } from '@sinclair/typebox'
import { Elysia, status } from 'elysia'
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '@/modules/auth-and-users/domain/application/constants'
import type { LoginUseCase } from '@/modules/auth-and-users/domain/application/use-cases'

type LoginRouteProps = {
	loginUseCase: LoginUseCase
}

const errorSchema = Type.Object({ error: Type.String() })

export class LoginRoute extends Class<LoginRouteProps> {
	constructor(protected override props: LoginRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
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
				detail: {
					summary: 'Realizar login',
					tags: ['Auth'],
					responses: {
						...loginRouteSchemas.detailResponses,
						401: {
							description: '',
							content: { 'application/json': { schema: errorSchema } },
						},
					},
				},
				body: loginRouteSchemas.body,
				response: {
					...loginRouteSchemas.response,
					401: errorSchema,
				},
			}
		)
	}
}
