import { Class, type IdGenerator, type UniqueId } from '@repo/core'

export type StudentProps = {
	id: UniqueId
	email: string
	name: string
	avatar?: string

	// Metadados
	emailVerifiedAt?: Date
	lastLoginAt?: Date
	lastLoginIp?: string
	createdAt: Date
	updatedAt: Date
}

type CreateStudentInput = Optional<
	Omit<StudentProps, 'id'>,
	'createdAt' | 'updatedAt'
>

type CreationParams = {
	idGenerator: IdGenerator
	input: CreateStudentInput
	id?: UniqueId
}

export type UpdateStudentInput = Partial<
	Pick<
		StudentProps,
		'name' | 'avatar' | 'emailVerifiedAt' | 'lastLoginAt' | 'lastLoginIp'
	>
>

export class Student extends Class<StudentProps> {
	protected constructor(protected props: StudentProps) {
		super()
	}

	static async create({ idGenerator, input, id }: CreationParams) {
		const { createdAt = new Date(), updatedAt = new Date(), ...rest } = input

		if (!id) {
			id = await idGenerator.generate()
		}

		return new Student({ id, createdAt, updatedAt, ...rest })
	}

	get id(): UniqueId {
		return this.props.id
	}

	get email(): string {
		return this.props.email
	}

	get name(): string {
		return this.props.name
	}

	get avatar(): string | undefined {
		return this.props.avatar
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

	update(input: UpdateStudentInput): Student {
		return new Student({
			...this.props,
			...(input.name !== undefined && { name: input.name }),
			...(input.avatar !== undefined && { avatar: input.avatar }),
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
