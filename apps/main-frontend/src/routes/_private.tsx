import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_private')({
	beforeLoad: async ({ location, context }) => {
		try {
			if (!context.auth.isAuthenticated) {
				throw redirect({
					to: '/login',
					search: { redirect: location.href },
				})
			}
		} catch (error) {
			// Re-throw redirects (they're intentional, not errors)
			if (isRedirect(error)) throw error

			// Auth check failed (network error, etc.) - redirect to login
			throw redirect({
				to: '/login',
				search: { redirect: location.href },
			})
		}
	},
})
