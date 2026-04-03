import {
	createRootRoute,
	createRootRouteWithContext,
	Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import NotFound from '@/components/NotFound'
import { GlobalError } from './-GlobalError'
import type { AuthContext } from '@/auth'

interface MyRouterContext {
	auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => {
		return (
			<>
				<Outlet />
				<TanStackRouterDevtools />
			</>
		)
	},
	notFoundComponent: NotFound,
	errorComponent: GlobalError,
})
