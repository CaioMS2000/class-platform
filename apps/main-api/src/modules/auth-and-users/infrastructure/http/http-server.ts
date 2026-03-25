import '@/main'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { env } from '@/config/env'

// Instance - initial setup
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

// Routes
app.use(container.cradle.adminHttpController.getRouters())

// Listen
app.listen(env.PORT)

console.log(`Server running on: ${app.server?.url}`)

export type App = typeof app
