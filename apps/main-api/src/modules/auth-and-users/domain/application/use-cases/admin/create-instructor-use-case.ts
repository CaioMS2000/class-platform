import { type Result, type IdGenerator, UseCase, success } from '@repo/core'
import { Instructor } from '../../../models/instructor'
import { InstructorRepository } from '../../repositories/instructor-repository'

export type CreateInstructorUseCaseRequest = {
	email: string
	passwordHash: string
	name: string
	avatar?: string
}

export type CreateInstructorUseCaseResponse = Result<
	never,
	{ instructor: Instructor }
>

type UseCaseProps = {
	instructorRepository: InstructorRepository
	idGenerator: IdGenerator
}

export class CreateInstructorUseCase extends UseCase<
	CreateInstructorUseCaseRequest,
	CreateInstructorUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: CreateInstructorUseCaseRequest
	): Promise<CreateInstructorUseCaseResponse> {
		const { email, passwordHash, name, avatar } = input
		const instructor = await Instructor.create({
			idGenerator: this.props.idGenerator,
			input: { email, passwordHash, name, avatar },
		})
		await this.props.instructorRepository.save(instructor)
		return success({ instructor })
	}
}
