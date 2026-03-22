import type { Enrollment } from '../../domain/models/enrollment'

export abstract class EnrollmentRepository {
	abstract findById(id: string): Promise<Enrollment | null>
	abstract findStudentCourseEnrollment(
		id: string,
		courseId: string
	): Promise<Enrollment | null>
	abstract save(enrollment: Enrollment): Promise<void>
}
