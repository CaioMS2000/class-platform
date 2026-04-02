import { env } from '@/config/env'
import { app } from './app'

let routesInitialized = false

export function initHttpRoutes() {
	if (routesInitialized) return
	routesInitialized = true

	app.use(container.cradle.adminRouter.getRouter())
	app.use(container.cradle.authRouter.getRouter())
	app.use(container.cradle.categoryRouter.getRouter())
	app.use(container.cradle.courseRouter.getRouter())
	app.decorate('jwtService', container.cradle.jwtService)
}

export function initHttpServer(PORT = env.PORT) {
	initHttpRoutes()
	app.listen(PORT)
	console.log(`Server running on: ${app.server?.url}`)
}
