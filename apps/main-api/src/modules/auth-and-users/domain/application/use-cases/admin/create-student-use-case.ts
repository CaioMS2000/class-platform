import { type Result, type IdGenerator, UseCase, success } from '@repo/core'
import { Student } from '../../../models/student'
import { StudentRepository } from '../../repositories/student-repository'

export type CreateStudentUseCaseRequest = {
	email: string
	passwordHash: string
	name: string
	avatar?: string
}

export type CreateStudentUseCaseResponse = Result<never, { student: Student }>

type UseCaseProps = {
	studentRepository: StudentRepository
	idGenerator: IdGenerator
}

export class CreateStudentUseCase extends UseCase<
	CreateStudentUseCaseRequest,
	CreateStudentUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateStudentUseCaseRequest
	): Promise<CreateStudentUseCaseResponse> {
		const { email, passwordHash, name, avatar } = input
		const student = await Student.create({
			idGenerator: this.props.idGenerator,
			input: { email, passwordHash, name, avatar },
		})
		await this.props.studentRepository.save(student)
		return success({ student })
	}
}
