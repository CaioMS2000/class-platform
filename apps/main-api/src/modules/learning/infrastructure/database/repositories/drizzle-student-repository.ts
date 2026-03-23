import { eq } from 'drizzle-orm'
import { drizzle } from '@/lib/drizzle'
import { StudentRepository } from '../../../application/repositories/student-repository'
import type { Student } from '../../../domain/models/student'
import { students } from '@/modules/auth-and-users/infrastructure/database/schema'
import { StudentMapper } from '../mappers/student-mapper'

export class DrizzleStudentRepository extends StudentRepository {
	async findById(id: string): Promise<Student | null> {
		const [row] = await drizzle
			.select()
			.from(students)
			.where(eq(students.id, id))
		if (!row) return null
		return StudentMapper.toDomain(row)
	}

	async save(student: Student): Promise<void> {
		const { id, createdAt, ...updateData } =
			StudentMapper.toPersistence(student)
		await drizzle
			.update(students)
			.set(updateData)
			.where(eq(students.id, student.id))
	}
}
