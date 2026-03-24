import '../global'
import {
	asFunction,
	createContainer,
	InjectionMode,
	type AwilixContainer,
} from 'awilix'
import type {
	JwtService,
	JwtTokenGenerator,
} from './modules/auth-and-users/domain/application/jwt'
import { TokenService } from './modules/auth-and-users/infrastructure/auth/token-service'

interface CradleInterface {
	jwtService: JwtService
	jwtTokenGenerator: JwtTokenGenerator
}

const _container = createContainer({
	injectionMode: InjectionMode.PROXY,
})

declare global {
	const container: AwilixContainer<CradleInterface>
}

Object.assign(globalThis, {
	container: _container,
})

container.register({
	jwtService: asFunction(() => new TokenService()).singleton(),
	jwtTokenGenerator: asFunction(() => new TokenService()).singleton(),
})
