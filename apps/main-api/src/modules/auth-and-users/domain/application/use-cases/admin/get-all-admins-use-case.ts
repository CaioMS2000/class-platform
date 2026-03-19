import { type Result, UseCase, success } from '@repo/core'
import { Admin } from '../../../models/admin'
import { AdminRepository, AdminFilters } from '../../repositories/admin-repository'
import { Pagination } from '../../repositories/params'

export type GetAllAdminsUseCaseRequest = {
	filters?: AdminFilters
	pagination?: Pagination
}
export type GetAllAdminsUseCaseResponse = Result<never, { admins: Admin[] }>

type UseCaseProps = { adminRepository: AdminRepository }

export class GetAllAdminsUseCase extends UseCase<
	GetAllAdminsUseCaseRequest,
	GetAllAdminsUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: GetAllAdminsUseCaseRequest
	): Promise<GetAllAdminsUseCaseResponse> {
		const { filters, pagination } = input
		const admins = await this.props.adminRepository.findMany(
			filters,
			pagination
		)
		return success({ admins })
	}
}
