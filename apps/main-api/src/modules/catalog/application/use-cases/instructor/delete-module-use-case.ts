import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { ModuleNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorDeleteModuleUseCaseRequest = {
	moduleId: string
	instructorId: string
}

export type InstructorDeleteModuleUseCaseResponse = Result<
	ModuleNotFoundError | NotCourseOwnerError,
	null
>

type UseCaseProps = {
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
}

export class InstructorDeleteModuleUseCase extends UseCase<
	InstructorDeleteModuleUseCaseRequest,
	InstructorDeleteModuleUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorDeleteModuleUseCaseRequest
	): Promise<InstructorDeleteModuleUseCaseResponse> {
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

		await this.props.moduleRepository.delete(module)

		return success(null)
	}
}
