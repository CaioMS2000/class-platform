import { Class, type IdGenerator, type UniqueId } from '@repo/core'
import type { InstructorStatus } from './@types'

export type InstructorProps = {
	id: UniqueId
	email: string
	passwordHash: string
	name: string
	avatar?: string
	status: InstructorStatus

	// Metadados
	emailVerifiedAt?: Date
	lastLoginAt?: Date
	lastLoginIp?: string
	createdAt: Date
	updatedAt: Date
}

type CreateInstructorInput = Optional<
	Omit<InstructorProps, 'id'>,
	'status' | 'createdAt' | 'updatedAt'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateInstructorInput
	id?: UniqueId
}

export type UpdateInstructorInput = Partial<
	Pick<
		InstructorProps,
		| 'name'
		| 'avatar'
		| 'status'
		| 'emailVerifiedAt'
		| 'lastLoginAt'
		| 'lastLoginIp'
	>
>

export class Instructor extends Class<InstructorProps> {
	protected constructor(protected props: InstructorProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const {
			status = 'pending',
			createdAt = new Date(),
			updatedAt = new Date(),
			...rest
		} = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Instructor({ id, status, createdAt, updatedAt, ...rest })
	}

	get id(): UniqueId {
		return this.props.id
	}

	get email(): string {
		return this.props.email
	}

	get passwordHash(): string {
		return this.props.passwordHash
	}

	get name(): string {
		return this.props.name
	}

	get avatar(): string | undefined {
		return this.props.avatar
	}

	get status(): InstructorStatus {
		return this.props.status
	}

	get emailVerifiedAt(): Date | undefined {
		return this.props.emailVerifiedAt
	}

	get lastLoginAt(): Date | undefined {
		return this.props.lastLoginAt
	}

	get lastLoginIp(): string | undefined {
		return this.props.lastLoginIp
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	update(input: UpdateInstructorInput): Instructor {
		return new Instructor({
			...this.props,
			...(input.name !== undefined && { name: input.name }),
			...(input.avatar !== undefined && { avatar: input.avatar }),
			...(input.status !== undefined && { status: input.status }),
			...(input.emailVerifiedAt !== undefined && {
				emailVerifiedAt: input.emailVerifiedAt,
			}),
			...(input.lastLoginAt !== undefined && {
				lastLoginAt: input.lastLoginAt,
			}),
			...(input.lastLoginIp !== undefined && {
				lastLoginIp: input.lastLoginIp,
			}),
			updatedAt: new Date(),
		})
	}
}
