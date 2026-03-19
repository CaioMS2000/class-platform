import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Instructor } from '../../../models/instructor'
import { InstructorRepository } from '../../repositories/instructor-repository'
import { InstructorNotFoundError } from '../../@errors'

export type GetInstructorByAdminUseCaseRequest = { instructorId: string }
export type GetInstructorByAdminUseCaseResponse = Result<
	InstructorNotFoundError,
	{ instructor: Instructor }
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class GetInstructorByAdminUseCase extends UseCase<
	GetInstructorByAdminUseCaseRequest,
	GetInstructorByAdminUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetInstructorByAdminUseCaseRequest
	): Promise<GetInstructorByAdminUseCaseResponse> {
		const { instructorId } = input
		const instructor = await this.props.instructorRepository.findById(
			UniqueId(instructorId)
		)
		if (!instructor) return failure(new InstructorNotFoundError())
		return success({ instructor })
	}
}
