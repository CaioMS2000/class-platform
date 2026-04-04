import { Class } from '@repo/core'
import { routeSchemas as registerRouteSchemas } from '@repo/shared/http/schemas/typebox/auth/register'
import { Type } from '@sinclair/typebox'
import { Elysia, status } from 'elysia'
import type { RegisterUseCase } from '@/modules/auth-and-users/domain/application/use-cases'

type SignUpRouteProps = {
	registerUseCase: RegisterUseCase
}

const errorSchema = Type.Object({ error: Type.String() })

export class SignUpRoute extends Class<SignUpRouteProps> {
	constructor(protected override props: SignUpRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
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
				detail: {
					summary: 'Realizar cadastro',
					tags: ['Auth'],
					responses: {
						...registerRouteSchemas.detailResponses,
						409: {
							description: '',
							content: { 'application/json': { schema: errorSchema } },
						},
					},
				},
				body: registerRouteSchemas.body,
				response: {
					...registerRouteSchemas.response,
					409: errorSchema,
				},
			}
		)
	}
}
