import '../global'
import './container'
import { asFunction } from 'awilix'
import { TokenService } from './modules/auth-and-users/infrastructure/auth/token-service'
import { AdminHttpController } from './modules/auth-and-users/infrastructure/http/controllers/admin-controller'
import { GetAdminUseCase } from './modules/auth-and-users/domain/application/use-cases'
import { DrizzleAdminRepository } from './modules/auth-and-users/infrastructure/database/repositories/drizzle-admin-repository'

// Application
// Repositories
container.register({
	adminRepository: asFunction(() => new DrizzleAdminRepository()).singleton(),
})
// Use cases
container.register({
	getAdminUseCase: asFunction(
		({ adminRepository }) => new GetAdminUseCase({ adminRepository })
	).singleton(),
})
// Others
container.register({
	jwtService: asFunction(() => new TokenService()).singleton(),
	jwtTokenGenerator: asFunction(() => new TokenService()).singleton(),
})

// Infrastructure
container.register({
	adminHttpController: asFunction(
		({ getAdminUseCase }) => new AdminHttpController({ getAdminUseCase })
	).singleton(),
})
