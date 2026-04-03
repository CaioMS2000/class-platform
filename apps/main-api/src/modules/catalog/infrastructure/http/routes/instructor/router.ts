import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import type { InstructorCreateCourseUseCase } from '@/modules/catalog/application/use-cases'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'
import { CreateCourseRoute } from './create-course'

type InstructorRouterProps = {
	createCourseUseCase: InstructorCreateCourseUseCase
}

export class InstructorRouter extends Class<InstructorRouterProps> {
	constructor(protected override props: InstructorRouterProps) {
		super()
	}

	private readonly BASE_URL = `${BASE_URL}/instructor`
	private get Elysia() {
		return new Elysia({ prefix: this.BASE_URL })
	}

	getRouter() {
		const createCourse = new CreateCourseRoute({
			createCourseUseCase: this.props.createCourseUseCase,
		})

		const protectedRoutes = this.Elysia.use(authPlugin)
			.use(roleGuardPlugin(['instructor']))
			.use(createCourse.getRoute())

		return [protectedRoutes]
	}
}
