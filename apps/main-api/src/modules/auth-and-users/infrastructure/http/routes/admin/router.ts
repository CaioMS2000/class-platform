import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import type { GetAdminUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'
import { GetAdminMeRoute } from './get-admin-me'

type AdminRouterProps = {
	getAdminUseCase: GetAdminUseCase
}

export class AdminRouter extends Class<AdminRouterProps> {
	constructor(protected override props: AdminRouterProps) {
		super()
	}

	private readonly BASE_URL = `${BASE_URL}/admin`
	private get Elysia() {
		return new Elysia({ prefix: this.BASE_URL })
	}

	getRouter() {
		const getAdminMe = new GetAdminMeRoute({
			getAdminUseCase: this.props.getAdminUseCase,
		})

		return this.Elysia.use(authPlugin)
			.use(roleGuardPlugin('admin'))
			.use(getAdminMe.getRoute())
	}
}
