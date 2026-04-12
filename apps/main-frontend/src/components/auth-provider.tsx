import { useEffect, useState } from 'react'
import { postApiV1AuthRefresh } from '@/api/generated/auth/auth'
import { AccessToken } from '@/models/access-token'
import { useAuthStore } from '@/stores/auth-store'
import { router } from '@/router'

// WIP
export const AuthProvider = ({ children }) => {
	const setAccessToken = useAuthStore(s => s.setAccessToken)
	const accessToken = useAuthStore(s => s.accessToken)
	const [ready, setReady] = useState(false)

	async function refreshTokens() {
		const response = await postApiV1AuthRefresh()
		if (response.status === 200) {
			setAccessToken(AccessToken(response.data.access_token))
		} else {
			setAccessToken(null)
			router.navigate({ to: '/login' })
		}
	}

	useEffect(() => {
		if (!accessToken) {
			refreshTokens().finally(() => setReady(true))
		}
	}, [])

	if (!ready) return null
	return children
}
