import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { InstructorRepository } from '../../repositories/instructor-repository'
import { InstructorNotFoundError } from '../../@errors'

export type DeleteInstructorUseCaseRequest = { instructorId: string }
export type DeleteInstructorUseCaseResponse = Result<
	InstructorNotFoundError,
	null
>

type UseCaseProps = { instructorRepository: InstructorRepository }

export class DeleteInstructorUseCase extends UseCase<
	DeleteInstructorUseCaseRequest,
	DeleteInstructorUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteInstructorUseCaseRequest
	): Promise<DeleteInstructorUseCaseResponse> {
		const { instructorId } = input
		const instructor = await this.props.instructorRepository.findById(
			UniqueId(instructorId)
		)
		if (!instructor) return failure(new InstructorNotFoundError())
		await this.props.instructorRepository.delete(instructor)
		return success(null)
	}
}
