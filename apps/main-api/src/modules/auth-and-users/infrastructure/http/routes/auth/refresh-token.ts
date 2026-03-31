import { Class } from '@repo/core'
import { Elysia, status } from 'elysia'
import type { RefreshTokenUseCase } from '@/modules/auth-and-users/domain/application/use-cases'
import { REFRESH_TOKEN_EXPIRY_SECONDS } from '@/modules/auth-and-users/domain/application/constants'

type RefreshTokenRouteProps = {
	refreshTokenUseCase: RefreshTokenUseCase
}

export class RefreshTokenRoute extends Class<RefreshTokenRouteProps> {
	constructor(protected override props: RefreshTokenRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
			'/refresh',
			async ({ cookie }) => {
				const refreshToken = cookie.refresh_token?.value as string | undefined

				if (!refreshToken) {
					return status(401, { error: 'Refresh token ausente' })
				}

				const result = await this.props.refreshTokenUseCase.execute({
					refreshToken,
				})

				if (result.isFailure()) {
					cookie.refresh_token?.remove()
					return status(401, { error: result.value.message })
				}

				const { accessToken, refreshToken: newRefreshToken } = result.value

				cookie.refresh_token?.set({
					value: newRefreshToken,
					httpOnly: true,
					secure: true,
					sameSite: 'strict',
					maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
					path: '/',
				})

				return { access_token: accessToken }
			},
			{
				detail: { summary: 'Renovar access token', tags: ['Auth'] },
			}
		)
	}
}
