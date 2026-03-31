import { Class } from '@repo/core'
import { routeSchemas } from '@repo/shared/http/schemas/typebox/catalog-routes/browse-catalog'
import { Elysia, status } from 'elysia'
import type { BrowsePublicCatalogUseCase } from '@/modules/catalog/application/use-cases'

type BrowseCatalogRouteProps = {
	browsePublicCatalogUseCase: BrowsePublicCatalogUseCase
}

export class BrowseCatalogRoute extends Class<BrowseCatalogRouteProps> {
	constructor(protected override props: BrowseCatalogRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().get(
			'/browse',
			async ({ query }) => {
				const result = await this.props.browsePublicCatalogUseCase.execute({
					filters: { ...query },
					pagination: { ...query },
				})

				return status(200, result.value.courses)
			},
			{
				detail: {
					summary: 'Navegar pelo catálogo público de cursos.',
					tags: ['Courses'],
				},
				response: {
					...routeSchemas.response,
				},
				query: routeSchemas.query,
			}
		)
	}
}
