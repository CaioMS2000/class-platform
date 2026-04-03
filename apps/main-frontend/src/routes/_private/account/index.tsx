import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/account/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_private/"!</div>
}
