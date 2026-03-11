import {
	Result,
	IdGenerator,
	UseCase,
	success,
	UniqueId,
	failure,
} from '@repo/core'
import { Lesson } from '../../domain/entities/lesson'
import { LessonRepository } from '../repositories/lesson-repository'
import { ModuleRepository } from '../repositories/module-repository'
import { CourseRepository } from '../repositories/course-repository'
import { ModuleNotFoundError, CourseNotFoundError } from '../@errors'
import { LessonContent, LessonType } from '../../domain/@types'

export type CreateLessonUseCaseRequest = {
	moduleId: string
	courseId: string
	order: number
	title: string
	description?: string
	type: LessonType
	content: LessonContent
	duration: number
	isFree: boolean
	requiresPrevious?: boolean
}

export type CreateLessonUseCaseResponse = Result<
	ModuleNotFoundError | CourseNotFoundError,
	{
		lesson: Lesson
	}
>

type UseCaseProps = {
	lessonRepository: LessonRepository
	moduleRepository: ModuleRepository
	courseRepository: CourseRepository
	idGenerator: IdGenerator
}

export class CreateLessonUseCase extends UseCase<
	CreateLessonUseCaseRequest,
	CreateLessonUseCaseResponse,
	UseCaseProps
> {
	constructor(protected props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateLessonUseCaseRequest
	): Promise<CreateLessonUseCaseResponse> {
		const {
			moduleId,
			courseId,
			order,
			title,
			description,
			type,
			content,
			duration,
			isFree,
			requiresPrevious,
		} = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)
		if (!course) {
			return failure(new CourseNotFoundError())
		}

		const module = await this.props.moduleRepository.findById(
			UniqueId(moduleId)
		)
		if (!module) {
			return failure(new ModuleNotFoundError())
		}

		const lesson = await Lesson.create({
			input: {
				moduleId: UniqueId(moduleId),
				courseId: UniqueId(courseId),
				order,
				title,
				description,
				type,
				content,
				duration,
				isFree,
				requiresPrevious,
			},
			idGenerator: this.props.idGenerator,
		})

		await this.props.lessonRepository.save(lesson)

		return success({ lesson })
	}
}
