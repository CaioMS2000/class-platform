import {
	Result,
	IdGenerator,
	UseCase,
	success,
	UniqueId,
	failure,
} from '@repo/core'
import { Module } from '../../../domain/entities/module'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { CourseNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorCreateModuleUseCaseRequest = {
	courseId: string
	instructorId: string
	title: string
	description?: string
	order: number
}

export type InstructorCreateModuleUseCaseResponse = Result<
	CourseNotFoundError | NotCourseOwnerError,
	{
		module: Module
	}
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
	idGenerator: IdGenerator
}

export class InstructorCreateModuleUseCase extends UseCase<
	InstructorCreateModuleUseCaseRequest,
	InstructorCreateModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorCreateModuleUseCaseRequest
	): Promise<InstructorCreateModuleUseCaseResponse> {
		const { title, description, courseId, instructorId, order } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		if (course.instructorId !== UniqueId(instructorId)) {
			return failure(new NotCourseOwnerError())
		}

		const module = await Module.create({
			input: {
				title,
				description,
				courseId: UniqueId(courseId),
				order,
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.moduleRepository.save(module)

		return success({ module })
	}
}
