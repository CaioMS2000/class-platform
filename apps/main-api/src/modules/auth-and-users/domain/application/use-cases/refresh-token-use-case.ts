import {
	failure,
	type Result,
	success,
	type UniqueId,
	UseCase,
} from '@repo/core'
import type { RefreshTokenRepository } from '../repositories/refresh-token-repository'
import type { AdminRepository } from '../repositories/admin-repository'
import type { InstructorRepository } from '../repositories/instructor-repository'
import type { StudentRepository } from '../repositories/student-repository'
import type { JwtService } from '../jwt'
import type { JwtTokenGenerator } from '../jwt'
import { InvalidRefreshTokenError } from '../@errors/invalid-refresh-token-error'
import { TokenReplayDetectedError } from '../@errors/token-replay-detected-error'
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '../constants'

export type RefreshTokenUseCaseRequest = {
	refreshToken: string
}

export type RefreshTokenUseCaseResponse = Result<
	InvalidRefreshTokenError | TokenReplayDetectedError,
	{
		accessToken: string
		refreshToken: string
	}
>

type UseCaseProps = {
	refreshTokenRepository: RefreshTokenRepository
	adminRepository: AdminRepository
	instructorRepository: InstructorRepository
	studentRepository: StudentRepository
	jwtService: JwtService
	tokenGenerator: JwtTokenGenerator
}

export class RefreshTokenUseCase extends UseCase<
	RefreshTokenUseCaseRequest,
	RefreshTokenUseCaseResponse,
	UseCaseProps
> {
	constructor(protected override props: UseCaseProps) {
		super()
	}

	async execute(
		input: RefreshTokenUseCaseRequest
	): Promise<RefreshTokenUseCaseResponse> {
		const tokenHash = await this.props.tokenGenerator.hashRefreshToken(
			input.refreshToken
		)

		const stored =
			await this.props.refreshTokenRepository.findByTokenHash(tokenHash)

		if (!stored) {
			return failure(InvalidRefreshTokenError)
		}

		// Replay detection: token already used → revoke all tokens for this user
		if (stored.used) {
			await this.props.refreshTokenRepository.revokeAllForUser(stored.userId)
			return failure(TokenReplayDetectedError)
		}

		// Mark current token as used (for replay detection)
		await this.props.refreshTokenRepository.markUsed(tokenHash)

		let user: { id: UniqueId; name: string; email: string } | null = null

		switch (stored.role) {
			case 'ADMIN': {
				user = await this.props.adminRepository.findById(stored.userId)
				break
			}
			case 'INSTRUCTOR': {
				user = await this.props.instructorRepository.findById(stored.userId)
				break
			}
			case 'STUDENT': {
				user = await this.props.studentRepository.findById(stored.userId)
				break
			}
		}

		if (!user) {
			await this.props.refreshTokenRepository.revoke(tokenHash)
			return failure(InvalidRefreshTokenError)
		}

		// Generate new token pair
		const accessToken = await this.props.jwtService.sign({
			sub: user.id,
			name: user.name,
			email: user.email,
			role: stored.role,
		})

		const newRefreshToken =
			await this.props.tokenGenerator.generateRefreshToken()
		const newRefreshTokenHash =
			await this.props.tokenGenerator.hashRefreshToken(newRefreshToken)

		await this.props.refreshTokenRepository.save(
			user.id,
			newRefreshTokenHash,
			REFRESH_TOKEN_EXPIRY_SECONDS,
			stored.role
		)

		// Revoke old token
		await this.props.refreshTokenRepository.revoke(tokenHash)

		return success({
			accessToken,
			refreshToken: newRefreshToken,
		})
	}
}
