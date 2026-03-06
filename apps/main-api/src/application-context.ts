import { UUIDV4Generator, UUIDV7Generator } from '@repo/core'

const _ApplicationContext = {
	idGenerator: {
		v4: new UUIDV4Generator(),
		v7: new UUIDV7Generator(),
	},
} as const

type ApplicationContextType = typeof _ApplicationContext

declare global {
	var ApplicationContext: ApplicationContextType
}

Object.assign(globalThis, {
	ApplicationContext: _ApplicationContext,
})
