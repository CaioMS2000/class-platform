import { and, eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { type UniqueId } from '@repo/core'
import { EnrollmentRepository } from '../../../application/repositories/enrollment-repository'
import { Enrollment } from '../../../domain/models/enrollment'
import { enrollments } from '../schema'
import { EnrollmentMapper } from '../mappers/enrollment-mapper'

export class DrizzleEnrollmentRepository extends EnrollmentRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async findById(id: UniqueId): Promise<Enrollment | null> {
		const [row] = await this.db
			.select()
			.from(enrollments)
			.where(eq(enrollments.id, id))
		if (!row) return null
		return EnrollmentMapper.toDomain(row)
	}

	async findStudentCourseEnrollment(
		userId: UniqueId,
		courseId: UniqueId
	): Promise<Enrollment | null> {
		const [row] = await this.db
			.select()
			.from(enrollments)
			.where(
				and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
			)
		if (!row) return null
		return EnrollmentMapper.toDomain(row)
	}

	async findManyByStudent(studentId: UniqueId): Promise<Enrollment[]> {
		const rows = await this.db
			.select()
			.from(enrollments)
			.where(eq(enrollments.userId, studentId))
		return Promise.all(rows.map(row => EnrollmentMapper.toDomain(row)))
	}

	async save(enrollment: Enrollment): Promise<void> {
		await this.db
			.insert(enrollments)
			.values(EnrollmentMapper.toPersistence(enrollment))
	}

	async update(enrollment: Enrollment): Promise<void> {
		const { id, userId, courseId, createdAt, ...updateData } =
			EnrollmentMapper.toPersistence(enrollment)
		await this.db
			.update(enrollments)
			.set(updateData)
			.where(eq(enrollments.id, enrollment.id))
	}
}
