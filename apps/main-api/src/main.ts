import '../global'
import './container'
import { initHttpServer } from './http/server'
import { UUIDV7Generator } from '@repo/core'
import { PasswordService } from './modules/auth-and-users/infrastructure/auth/password-service'
import { TokenService } from './modules/auth-and-users/infrastructure/auth/token-service'
import { registerAuthModule } from './modules/auth-and-users/register'
import { registerCatalogModule } from './modules/catalog/register'

// Shared services
container.register({
	jwtService: container.asFunction(() => new TokenService()).singleton(),
	jwtTokenGenerator: container.asFunction(() => new TokenService()).singleton(),
	hashVerifier: container.asFunction(() => new PasswordService()).singleton(),
	hashGenerator: container.asFunction(() => new PasswordService()).singleton(),
	tokenGenerator: container.asFunction(() => new TokenService()).singleton(),
	idGenerator: container.asFunction(() => new UUIDV7Generator()).singleton(),
})

// Modules
registerAuthModule(container)
registerCatalogModule(container)

// Start HTTP server
initHttpServer()
