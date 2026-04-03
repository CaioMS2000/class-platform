import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function GlobalError({
	error,
	reset,
}: {
	error: unknown
	reset: () => void
}) {
	const navigate = useNavigate()

	useEffect(() => {
		const msg = error instanceof Error ? error.message : String(error)
		if (msg.includes('User is not logged in')) {
			navigate({
				to: '/auth',
				search: { redirect: window.location.pathname || '/' },
				replace: true,
			})
			return
		}
	}, [error, navigate])

	return (
		<div className="p-6">
			<h2 className="text-lg font-semibold">Opa, algo deu errado.</h2>
			<p className="text-sm opacity-80 mt-2">
				{error instanceof Error ? error.message : String(error)}
			</p>
			<button className="mt-4 underline" onClick={reset}>
				Tentar novamente
			</button>
		</div>
	)
}
