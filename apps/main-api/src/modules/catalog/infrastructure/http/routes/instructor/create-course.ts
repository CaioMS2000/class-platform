import { Class } from '@repo/core'
import { routeSchemas as createCourseRouteSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/create-course'
import { insufficientPermissionsResponse } from '@repo/shared/http/schemas/typebox/responses'
import { Elysia, status } from 'elysia'
import type { InstructorCreateCourseUseCase } from '@/modules/catalog/application/use-cases'
import { mapErrorToHttp } from '@/modules/catalog/infrastructure/http/map-error-to-http'

type CreateCourseRouteProps = {
	createCourseUseCase: InstructorCreateCourseUseCase
}

export class CreateCourseRoute extends Class<CreateCourseRouteProps> {
	constructor(protected override props: CreateCourseRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
			'new-course',
			async ({ body }) => {
				const result = await this.props.createCourseUseCase.execute({
					...body,
					price: { amount: body.price.amount, currency: body.price.currency },
					promotionalPrice: body.promotionalPrice
						? {
								amount: body.promotionalPrice.amount,
								currency: body.promotionalPrice.currency,
							}
						: undefined,
				})

				if (result.isFailure()) return mapErrorToHttp(result.value)

				return status(201, result.value.course)
			},
			{
				detail: { summary: 'Criar um novo curso.', tags: ['Courses'] },
				response: {
					...createCourseRouteSchemas.response,
					...insufficientPermissionsResponse,
				},
				body: createCourseRouteSchemas.body,
			}
		)
	}
}
