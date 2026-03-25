import '@/main'
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { env } from '@/config/env'

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: { title: 'Main API', version: '1.0.0' },
			},
			path: '/doc',
		})
	)
	.decorate('jwtService', container.cradle.jwtService)
	.get('/health', () => 'OK')
	.get('/healthy', () => 'Yes')
	.use(container.cradle.adminHttpController.createPlugin())
	.listen(env.PORT)

console.log(`Server running on: ${app.server?.url}`)

export type App = typeof app
