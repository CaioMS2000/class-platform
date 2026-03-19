import { type Result, UseCase, UniqueId, success, failure } from '@repo/core'
import { Admin } from '../../../models/admin'
import { AdminRepository } from '../../repositories/admin-repository'
import { AdminNotFoundError } from '../../@errors'

export type GetAdminUseCaseRequest = { adminId: string }
export type GetAdminUseCaseResponse = Result<
	AdminNotFoundError,
	{ admin: Admin }
>

type UseCaseProps = { adminRepository: AdminRepository }

export class GetAdminUseCase extends UseCase<
	GetAdminUseCaseRequest,
	GetAdminUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAdminUseCaseRequest
	): Promise<GetAdminUseCaseResponse> {
		const { adminId } = input
		const admin = await this.props.adminRepository.findById(UniqueId(adminId))
		if (!admin) return failure(new AdminNotFoundError())
		return success({ admin })
	}
}
