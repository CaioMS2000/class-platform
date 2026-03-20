import { Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Lesson } from '../../../domain/entities/lesson'
import { LessonRepository } from '../../repositories/lesson-repository'
import { ModuleRepository } from '../../repositories/module-repository'
import { CourseRepository } from '../../repositories/course-repository'
import { ModuleNotFoundError, NotCourseOwnerError } from '../../@errors'

export type InstructorGetAllLessonsUseCaseRequest = {
	moduleId: string
	instructorId: string
}

export type InstructorGetAllLessonsUseCaseResponse = Result<
	ModuleNotFoundError | NotCourseOwnerError,
	{
		lessons: Lesson[]
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
}

export class InstructorGetAllLessonsUseCase extends UseCase<
	InstructorGetAllLessonsUseCaseRequest,
	InstructorGetAllLessonsUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: InstructorGetAllLessonsUseCaseRequest
	): Promise<InstructorGetAllLessonsUseCaseResponse> {
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

		const lessons = await this.props.lessonRepository.findManyByModuleId(
			UniqueId(moduleId)
		)

		return success({ lessons })
	}
}
