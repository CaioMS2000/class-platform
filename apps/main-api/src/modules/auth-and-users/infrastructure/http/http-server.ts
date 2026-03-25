import '@/main'
import { httpServerApp } from './http-server-app'
import { createDependenciesMiddleware } from './middlewares/dependencies'
import { env } from '@/config/env'

async function init() {
	httpServerApp.get('/health', ctx => ctx.text('OK'))
	httpServerApp.get('/healthy', ctx => ctx.text('Yes'))

	const dependenciesMiddleware = createDependenciesMiddleware({
		jwtService: container.cradle.jwtService,
	})

	httpServerApp.use('*', dependenciesMiddleware)

	container.cradle.adminHttpController.registerRoutes()

	const httpServer = Bun.serve({
		port: env.PORT,
		fetch: httpServerApp.fetch,
	})

	console.log(
		`Server running on: ${httpServer.protocol}://${httpServer.hostname}:${httpServer.port}`
	)
}

init()
