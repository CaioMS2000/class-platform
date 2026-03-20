import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Module } from '../../../domain/entities/module'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorGetAllModulesUseCaseRequest = {
	courseId: string
	instructorId: string
}

export type InstructorGetAllModulesUseCaseResponse = Result<
	CourseNotFoundError | NotCourseOwnerError,
	{
		modules: Module[]
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
}

export class InstructorGetAllModulesUseCase extends UseCase<
	InstructorGetAllModulesUseCaseRequest,
	InstructorGetAllModulesUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorGetAllModulesUseCaseRequest
	): Promise<InstructorGetAllModulesUseCaseResponse> {
		const { courseId, instructorId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		if (course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
		}

		const modules = await this.props.moduleRepository.findManyByCourseId(
			UniqueId(courseId)
		)

		return success({ modules })
	}
}
