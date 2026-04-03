import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './auth'
import { router } from './router'
import { Toaster } from '@/components/ui/sonner'

function InnerApp() {
	const auth = useAuth()
	return <RouterProvider router={router} context={{ auth }} />
}

function App() {
	return (
		<AuthProvider>
			<InnerApp />
			<Toaster richColors />
		</AuthProvider>
	)
}

export default App
