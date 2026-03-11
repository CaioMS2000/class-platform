import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Instructor } from '../../models/instructor'
import { InstructorRepository } from '../repositories/instructor-repository'
import { InstructorNotFoundError } from '../@errors'

export type GetInstructorUseCaseRequest = { instructorId: string }
export type GetInstructorUseCaseResponse = Result<
	InstructorNotFoundError,
	{ instructor: Instructor }
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class GetInstructorUseCase extends UseCase<
	GetInstructorUseCaseRequest,
	GetInstructorUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetInstructorUseCaseRequest
	): Promise<GetInstructorUseCaseResponse> {
		const { instructorId } = input
		const instructor = await this.props.instructorRepository.findById(
			UniqueId(instructorId)
		)
		if (!instructor) return failure(new InstructorNotFoundError())
		return success({ instructor })
	}
}
