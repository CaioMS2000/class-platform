import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './auth'
import { router } from './router'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from './lib/react-query'

function InnerApp() {
	const auth = useAuth()
	return <RouterProvider router={router} context={{ auth }} />
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<InnerApp />
				<Toaster richColors />
			</AuthProvider>
		</QueryClientProvider>
	)
}

export default App
