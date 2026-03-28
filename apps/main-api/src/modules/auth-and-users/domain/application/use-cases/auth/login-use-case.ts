import { failure, type Result, success, UseCase } from '@repo/core'
import type { AdminRepository } from '../../repositories/admin-repository'
import type { InstructorRepository } from '../../repositories/instructor-repository'
import type { StudentRepository } from '../../repositories/student-repository'
import type { RefreshTokenRepository } from '../../repositories/refresh-token-repository'
import type { HashVerifier } from '../../cryptography/hash-verifier'
import type { JwtService } from '../../jwt'
import type { JwtTokenGenerator } from '../../jwt'
import { InvalidCredentialsError } from '../../@errors'
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '../../constants'
import type { HTTPUser } from '../../../models/http-user'

export type LoginUseCaseRequest = {
	email: string
	password: string
}

export type LoginUseCaseResponse = Result<
	InvalidCredentialsError,
	{
		accessToken: string
		refreshToken: string
		user: HTTPUser
	}
>

type UseCaseProps = {
	adminRepository: AdminRepository
	instructorRepository: InstructorRepository
	studentRepository: StudentRepository
	hashVerifier: HashVerifier
	jwtService: JwtService
	tokenGenerator: JwtTokenGenerator
	refreshTokenRepository: RefreshTokenRepository
}

export class LoginUseCase extends UseCase<
	LoginUseCaseRequest,
	LoginUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(input: LoginUseCaseRequest): Promise<LoginUseCaseResponse> {
		const [admin, instructor, student] = await Promise.all([
			this.props.adminRepository.findByEmail(input.email),
			this.props.instructorRepository.findByEmail(input.email),
			this.props.studentRepository.findByEmail(input.email),
		])

		const user = admin ?? instructor ?? student
		const role = admin
			? 'ADMIN'
			: instructor
				? 'INSTRUCTOR'
				: student
					? 'STUDENT'
					: null

		if (!user || !user.passwordHash || !role) {
			return failure(InvalidCredentialsError)
		}

		const passwordValid = await this.props.hashVerifier.verify(
			user.passwordHash,
			input.password
		)

		if (!passwordValid) {
			return failure(InvalidCredentialsError)
		}

		const accessToken = await this.props.jwtService.signAccessToken({
			sub: user.id,
			name: user.name,
			email: user.email,
			role,
		})

		const refreshToken = await this.props.tokenGenerator.generateRefreshToken()
		const refreshTokenHash =
			await this.props.tokenGenerator.hashRefreshToken(refreshToken)

		await this.props.refreshTokenRepository.save(
			user.id,
			refreshTokenHash,
			REFRESH_TOKEN_EXPIRY_SECONDS,
			role
		)

		return success({
			accessToken,
			refreshToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role,
			},
		})
	}
}
