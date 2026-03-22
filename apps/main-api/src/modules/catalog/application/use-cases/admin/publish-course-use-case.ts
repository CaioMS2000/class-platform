import {
	type Result,
	type FailureOf,
	UseCase,
	UniqueId,
	success,
	failure,
} from '@repo/core'
import type { Course } from '../../../domain/entities/course'
import type { CourseRepository } from '../../repositories/course-repository'
import type { ModuleRepository } from '../../repositories/module-repository'
import { CourseNotFoundError } from '../../@errors'
import type { CoursePublicationService } from '@/modules/catalog/domain/domain-services/course-publication-service'

export type AdminPublishCourseUseCaseRequest = {
	courseId: string
}

export type AdminPublishCourseUseCaseResponse = Result<
	| CourseNotFoundError
	| FailureOf<ReturnType<CoursePublicationService['publish']>>,
	{
		course: Course
	}
>

type UseCaseProps = {
	courseRepository: CourseRepository
	moduleRepository: ModuleRepository
	coursePublicationService: CoursePublicationService
}

export class AdminPublishCourseUseCase extends UseCase<
	AdminPublishCourseUseCaseRequest,
	AdminPublishCourseUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: AdminPublishCourseUseCaseRequest
	): Promise<AdminPublishCourseUseCaseResponse> {
		const { courseId } = input

		const course = await this.props.courseRepository.findById(
			UniqueId(courseId)
		)

		if (!course) {
			return failure(new CourseNotFoundError())
		}

		const modules = await this.props.moduleRepository.findManyByCourseId(
			course.id
		)
		const publishResult = this.props.coursePublicationService.publish(
			course,
			modules
		)

		if (publishResult.isFailure()) {
			return failure(publishResult.value)
		}

		const updatedCourse = publishResult.value

		await this.props.courseRepository.update(updatedCourse)

		return success({ course: updatedCourse })
	}
}
