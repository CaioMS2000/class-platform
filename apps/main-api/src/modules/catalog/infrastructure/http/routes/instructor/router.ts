import { Class } from '@repo/core'
import { Elysia } from 'elysia'
import type {
	InstructorCreateCourseUseCase,
	InstructorCreateModuleUseCase,
	InstructorCreateLessonUseCase,
} from '@/modules/catalog/application/use-cases'
import { BASE_URL } from '@/http/constants'
import { authPlugin } from '@/http/middlewares/auth'
import { roleGuardPlugin } from '@/http/middlewares/role-guard'
import { CreateCourseRoute } from './create-course'
import { CreateModuleRoute } from './create-module'
import { CreateLessonRoute } from './create-lesson'

type InstructorRouterProps = {
	createCourseUseCase: InstructorCreateCourseUseCase
	createModuleUseCase: InstructorCreateModuleUseCase
	createLessonUseCase: InstructorCreateLessonUseCase
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
		const createModule = new CreateModuleRoute({
			createModuleUseCase: this.props.createModuleUseCase,
		})
		const createLesson = new CreateLessonRoute({
			createLessonUseCase: this.props.createLessonUseCase,
		})

		const protectedRoutes = this.Elysia.use(authPlugin)
			.use(roleGuardPlugin(['instructor']))
			.use(createCourse.getRoute())
			.use(createModule.getRoute())
			.use(createLesson.getRoute())

		return [protectedRoutes]
	}
}
