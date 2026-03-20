import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Module } from '../../../domain/entities/module'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { ModuleNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorGetModuleUseCaseRequest = {
	moduleId: string
	instructorId: string
}

export type InstructorGetModuleUseCaseResponse = Result<
	ModuleNotFoundError | NotCourseOwnerError,
	{
		module: Module
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
}

export class InstructorGetModuleUseCase extends UseCase<
	InstructorGetModuleUseCaseRequest,
	InstructorGetModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorGetModuleUseCaseRequest
	): Promise<InstructorGetModuleUseCaseResponse> {
		const { moduleId, instructorId } = input

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

		return success({ module })
	}
}
