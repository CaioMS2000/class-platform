import { create } from 'zustand'
import type { AccessToken } from '@/models/access-token'

export type AuthState = {
	accessToken: AccessToken | null
	setAccessToken: (token: AccessToken | null) => void
	clear: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
	accessToken: null,
	setAccessToken: token => set({ accessToken: token }),
	clear: () => set({ accessToken: null }),
}))
