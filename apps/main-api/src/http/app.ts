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
	.get('/health', () => 'OK', {
		detail: { summary: 'Estado do servidor.', tags: ['Application'] },
	})
	.get('/healthy', () => 'Yes', {
		detail: { summary: 'Estado do servidor.', tags: ['Application'] },
	})

type App = typeof app

export { type App, app }
