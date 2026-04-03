import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/register/')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' })
		}
	},
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_public/register/"!</div>
}
