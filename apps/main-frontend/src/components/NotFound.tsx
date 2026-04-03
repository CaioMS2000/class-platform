import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import NotFoundMessage from './NotFoundMessage'

const NotFound = () => {
	const pathname = useLocation({
		select: loc => loc.pathname,
	})

	useEffect(() => {
		console.error(
			'404 Error: User attempted to access non-existent route:',
			pathname
		)
	}, [pathname])

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<NotFoundMessage />
		</div>
	)
}

export default NotFound
