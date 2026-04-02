import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'

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
	.get('/health', () => 'OK')
	.get('/healthy', () => 'Yes')

type App = typeof app

export { type App, app }
