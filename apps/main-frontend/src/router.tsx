import { createRouter } from '@tanstack/react-router'
import type { AuthContext } from './auth'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
	routeTree,
	context: {
		auth: undefined! as AuthContext,
	},
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}
