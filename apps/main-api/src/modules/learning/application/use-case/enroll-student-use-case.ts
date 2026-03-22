import {
	failure,
	type IdGenerator,
	type Result,
	success,
	UseCase,
} from '@repo/core'
import { StudentAlreadyEnrolledError } from '../../domain/@errors/student-already-enrolled-error'
import { Enrollment } from '../../domain/models/enrollment'
import { CourseNotFoundError, StudentNotFoundError } from '../@errors'
import type { CourseRepository } from '../repositories/course-repository'
import type { EnrollmentRepository } from '../repositories/enrollment-repository'
import type { StudentRepository } from '../repositories/student-repository'

export type EnrollStudentUseCaseRequest = {
	studentId: string
	courseId: string
}

export type EnrollStudentUseCaseResponse = Result<
	StudentAlreadyEnrolledError | StudentNotFoundError | CourseNotFoundError,
	{
		enrollment: Enrollment
	}
>

type UseCaseProps = {
	idGenerator: IdGenerator
	studentRepository: StudentRepository
	courseRepository: CourseRepository
	enrollmentRepository: EnrollmentRepository
}

export class EnrollStudentUseCase extends UseCase<
	EnrollStudentUseCaseRequest,
	EnrollStudentUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: EnrollStudentUseCaseRequest
	): Promise<EnrollStudentUseCaseResponse> {
		const student = await this.props.studentRepository.findById(input.studentId)

		if (!student) return failure(new StudentNotFoundError())

		const course = await this.props.courseRepository.findById(input.courseId)

		if (!course) return failure(new CourseNotFoundError())

		const existingEnrollment =
			await this.props.enrollmentRepository.findStudentCourseEnrollment(
				input.studentId,
				input.courseId
			)

		if (existingEnrollment) return failure(new StudentAlreadyEnrolledError())

		const enrollment = await Enrollment.create({
			idGenerator: this.props.idGenerator,
			input: {
				userId: student.id,
				courseId: course.id,
				totalLessons: course.totalLessons,
			},
		})

		await this.props.enrollmentRepository.save(enrollment)

		return success({ enrollment })
	}
}
