import {
	failure,
	type IdGenerator,
	type Result,
	success,
	UniqueId,
	UseCase,
} from '@repo/core'
import type { Enrollment } from '../../domain/models/enrollment'
import { Progress } from '../../domain/models/progress'
import type { ProgressRangeError } from '../../domain/@errors/progress-range-error'
import { EnrollmentProgressValue } from '../../domain/value-objects'
import { EnrollmentNotFoundError } from '../@errors'
import type { EnrollmentRepository } from '../repositories/enrollment-repository'
import type { ProgressRepository } from '../repositories/progress-repository'

export type MarkLessonCompleteUseCaseRequest = {
	studentId: string
	courseId: string
	lessonId: string
}

export type MarkLessonCompleteUseCaseResponse = Result<
	EnrollmentNotFoundError | ProgressRangeError,
	{
		progress: Progress
		enrollment: Enrollment
	}
>

type UseCaseProps = {
	idGenerator: IdGenerator
	enrollmentRepository: EnrollmentRepository
	progressRepository: ProgressRepository
}

export class MarkLessonCompleteUseCase extends UseCase<
	MarkLessonCompleteUseCaseRequest,
	MarkLessonCompleteUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: MarkLessonCompleteUseCaseRequest
	): Promise<MarkLessonCompleteUseCaseResponse> {
		const enrollment =
			await this.props.enrollmentRepository.findStudentCourseEnrollment(
				UniqueId(input.studentId),
				UniqueId(input.courseId)
			)

		if (!enrollment) return failure(new EnrollmentNotFoundError())

		const existingProgress =
			await this.props.progressRepository.findByUserAndLesson(
				UniqueId(input.studentId),
				UniqueId(input.lessonId)
			)

		let progress: Progress

		if (existingProgress) {
			if (existingProgress.status === 'completed') {
				return success({ progress: existingProgress, enrollment })
			}

			progress = existingProgress.update({
				status: 'completed',
				completedAt: new Date(),
			})

			await this.props.progressRepository.update(progress)
		} else {
			progress = await Progress.create({
				idGenerator: this.props.idGenerator,
				input: {
					userId: UniqueId(input.studentId),
					courseId: UniqueId(input.courseId),
					lessonId: UniqueId(input.lessonId),
					status: 'completed',
					completedAt: new Date(),
					watchTime: 0,
					lastPosition: 0,
					timeSpent: 0,
				},
			})

			await this.props.progressRepository.save(progress)
		}

		const newCompleted = enrollment.completedLessons + 1
		const percentage = Math.min(
			100,
			Math.round((newCompleted / enrollment.totalLessons) * 100)
		)
		const progressValueResult = EnrollmentProgressValue.create(percentage)
		if (progressValueResult.isFailure())
			return failure(progressValueResult.value)
		const progressValue = progressValueResult.value

		const updatedEnrollment = enrollment.update({
			completedLessons: newCompleted,
			progressValue,
			...(percentage >= 100 && {
				status: 'completed',
				completedAt: new Date(),
			}),
		})

		await this.props.enrollmentRepository.update(updatedEnrollment)

		return success({ progress, enrollment: updatedEnrollment })
	}
}
