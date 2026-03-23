import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { StudentRepository } from '../../../application/repositories/student-repository'
import type { Student } from '../../../domain/models/student'
import { students } from '@/modules/auth-and-users/infrastructure/database/schema'
import { StudentMapper } from '../mappers/student-mapper'

export class DrizzleStudentRepository extends StudentRepository {
	constructor(private readonly db: NodePgDatabase) {
		super()
	}

	async findById(id: string): Promise<Student | null> {
		const [row] = await this.db
			.select()
			.from(students)
			.where(eq(students.id, id))
		if (!row) return null
		return StudentMapper.toDomain(row)
	}

	async save(student: Student): Promise<void> {
		const { id, createdAt, ...updateData } =
			StudentMapper.toPersistence(student)
		await this.db
			.update(students)
			.set(updateData)
			.where(eq(students.id, student.id))
	}
}
