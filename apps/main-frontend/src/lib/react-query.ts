import { ApiError } from '@/api/custom-fetch'
import { QueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/stores/user-store'
import { router } from '@/router'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			onError: error => {
				if (error instanceof ApiError) {
					if (error.status === 401) {
						useUserStore.getState().clearUser()
						router.navigate({ to: '/login' })
						return
					}
					if (error.status >= 500) {
						toast.error('Erro no servidor, tente novamente')
					}
				}
			},
		},
	},
})
