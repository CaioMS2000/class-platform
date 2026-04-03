import { Class } from '@repo/core'
import { routeSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/create-lesson'
import { insufficientPermissionsResponse } from '@repo/shared/http/schemas/typebox/responses'
import { Elysia, status } from 'elysia'
import type { InstructorCreateLessonUseCase } from '@/modules/catalog/application/use-cases'
import { mapErrorToHttp } from '@/modules/catalog/infrastructure/http/map-error-to-http'

type CreateLessonRouteProps = {
	createLessonUseCase: InstructorCreateLessonUseCase
}

export class CreateLessonRoute extends Class<CreateLessonRouteProps> {
	constructor(protected override props: CreateLessonRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
			'new-lesson',
			async ({ body }) => {
				const result = await this.props.createLessonUseCase.execute({
					...body,
				})

				if (result.isFailure()) return mapErrorToHttp(result.value)

				return status(201, result.value.lesson)
			},
			{
				detail: { summary: 'Criar uma nova aula.', tags: ['Courses'] },
				response: {
					...routeSchemas.response,
					...insufficientPermissionsResponse,
				},
				body: routeSchemas.body,
			}
		)
	}
}
