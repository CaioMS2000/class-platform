import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Module } from '../../../domain/entities/module'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { ModuleNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorUpdateModuleUseCaseRequest = {
	moduleId: string
	instructorId: string
	title?: string
	description?: string
	order?: number
}

export type InstructorUpdateModuleUseCaseResponse = Result<
	ModuleNotFoundError | NotCourseOwnerError,
	{
		module: Module
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
}

export class InstructorUpdateModuleUseCase extends UseCase<
	InstructorUpdateModuleUseCaseRequest,
	InstructorUpdateModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorUpdateModuleUseCaseRequest
	): Promise<InstructorUpdateModuleUseCaseResponse> {
		const { moduleId, instructorId, title, description, order } = input

		const module = await this.props.moduleRepository.findById(
			UniqueId(moduleId)
		)

		if (!module) {
			return failure(new ModuleNotFoundError())
		}

		const course = await this.props.courseRepository.findById(module.courseId)

		if (!course || course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
		}

		const updatedModule = module.update({ title, description, order })

		await this.props.moduleRepository.update(updatedModule)

		return success({ module: updatedModule })
	}
}
