import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import { BASE_URL } from '@/http/constants'
import type { BrowsePublicCatalogUseCase } from '@/modules/catalog/application/use-cases'
import { BrowseCatalogRoute } from './browse-catalog'

type CourseRouterProps = {
	browsePublicCatalogUseCase: BrowsePublicCatalogUseCase
}

export class CourseRouter extends Class<CourseRouterProps> {
	constructor(protected override props: CourseRouterProps) {
		super()
	}

	private readonly BASE_URL = `${BASE_URL}/course`
	private get Elysia() {
		return new Elysia({ prefix: this.BASE_URL })
	}

	getRouter() {
		const browseCatalog = new BrowseCatalogRoute({
			browsePublicCatalogUseCase: this.props.browsePublicCatalogUseCase,
		})

		// Rotas públicas (sem auth)
		const publicRoutes = this.Elysia.use(browseCatalog.getRoute())

		return [publicRoutes]
	}
}
