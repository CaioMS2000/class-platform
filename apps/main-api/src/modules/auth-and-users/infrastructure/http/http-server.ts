import { httpServerApp } from './http-server-app'
import { swaggerUI } from '@hono/swagger-ui'
import { Scalar } from '@scalar/hono-api-reference'
import { createDependenciesMiddleware } from './middlewares/dependencies'

httpServerApp.doc('/doc', {
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Main API',
	},
})

httpServerApp.get('/doc/ui', swaggerUI({ url: '/doc' }))
httpServerApp.get('/doc/scalar', Scalar({ url: '/doc', pageTitle: 'Main API' }))
httpServerApp.get('/health', ctx => ctx.text('OK'))
httpServerApp.get('/healthy', ctx => ctx.text('Yes'))

const dependenciesMiddleware = createDependenciesMiddleware({
	jwtService: container.cradle.jwtService,
})
httpServerApp.use('*', dependenciesMiddleware)
