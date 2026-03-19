import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { AdminRepository } from '../../repositories/admin-repository'
import { AdminNotFoundError } from '../../@errors'

export type DeleteAdminUseCaseRequest = { adminId: string }
export type DeleteAdminUseCaseResponse = Result<AdminNotFoundError, null>

type UseCaseProps = { adminRepository: AdminRepository }

export class DeleteAdminUseCase extends UseCase<
	DeleteAdminUseCaseRequest,
	DeleteAdminUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: DeleteAdminUseCaseRequest
	): Promise<DeleteAdminUseCaseResponse> {
		const { adminId } = input
		const admin = await this.props.adminRepository.findById(UniqueId(adminId))
		if (!admin) return failure(new AdminNotFoundError())
		await this.props.adminRepository.delete(admin)
		return success(null)
	}
}
