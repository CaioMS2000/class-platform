import type { UniqueId } from '@repo/core'
import type { Enrollment } from '../../domain/models/enrollment'

export abstract class EnrollmentRepository {
	abstract findById(id: UniqueId): Promise<Enrollment | null>
	abstract findStudentCourseEnrollment(
		id: UniqueId,
		courseId: UniqueId
	): Promise<Enrollment | null>
	abstract findManyByStudent(studentId: UniqueId): Promise<Enrollment[]>
	abstract save(enrollment: Enrollment): Promise<void>
}
