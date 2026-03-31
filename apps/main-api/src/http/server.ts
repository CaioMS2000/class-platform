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
	.get('/health', () => 'OK')
	.get('/healthy', () => 'Yes')

type App = typeof app

function initHttpServer(){
	// Routes
	app.use(container.cradle.adminHttpController.getRouter())
	app.use(container.cradle.authHttpController.getRouter())
	app.use(container.cradle.categoryHttpController.getRouter())
	app.decorate('jwtService', container.cradle.jwtService)

	// Listen
	app.listen(env.PORT)
	
	console.log(`Server running on: ${app.server?.url}`)
}

export { type App, initHttpServer, app }