import { Class } from '@repo/core'
import { Elysia, status } from 'elysia'
import type { LogoutUseCase } from '@/modules/auth-and-users/domain/application/use-cases'

type LogoutRouteProps = {
	logoutUseCase: LogoutUseCase
}

export class LogoutRoute extends Class<LogoutRouteProps> {
	constructor(protected override props: LogoutRouteProps) {
		super()
	}

	getRoute() {
		return new Elysia().post(
			'/logout',
			async ({ cookie }) => {
				const refreshToken = cookie.refresh_token?.value as string | undefined

				if (refreshToken) {
					await this.props.logoutUseCase.execute({ refreshToken })
				}

				cookie.refresh_token?.remove()

				return status(204)
			},
			{
				detail: { summary: 'Realizar logout', tags: ['Auth'] },
			}
		)
	}
}
