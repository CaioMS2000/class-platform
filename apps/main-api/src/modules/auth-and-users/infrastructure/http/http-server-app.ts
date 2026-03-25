import { swaggerUI } from '@hono/swagger-ui'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { logger } from 'hono/logger'
import type { JwtService } from '../../domain/application/jwt'
import type { HTTPUser } from '../../domain/models/http-user'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'

const theme = new SwaggerTheme()
const darkCss = theme.getBuffer(SwaggerThemeNameEnum.DARK)

type AppEnv = {
	Variables: {
		jwtService: JwtService
		user: HTTPUser
	}
}

const httpServerApp = new OpenAPIHono<AppEnv>()

httpServerApp.use(logger())
httpServerApp.doc('/doc', {
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Main API',
	},
})
httpServerApp.get(
	'/doc/ui',
	swaggerUI({
		url: '/doc',
		manuallySwaggerUIHtml: asset => `
    <div>
      <div id="swagger-ui"></div>
      ${asset.css.map(url => `<link rel="stylesheet" href="${url}" />`).join('\n')}
      <style>${darkCss}</style>
      ${asset.js.map(url => `<script src="${url}"></script>`).join('\n')}
      <script>
        SwaggerUIBundle({
          url: '/doc',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        })
      </script>
    </div>
  `,
	})
)
httpServerApp.get('/doc/scalar', Scalar({ url: '/doc', pageTitle: 'Main API' }))

export { createRoute, httpServerApp, type AppEnv }
