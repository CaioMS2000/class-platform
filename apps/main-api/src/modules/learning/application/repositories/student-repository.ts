import type { Student } from '../../domain/models/student'

export abstract class StudentRepository {
	abstract findById(id: string): Promise<Student | null>
	abstract save(student: Student): Promise<void>
}
