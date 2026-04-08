import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@/models/user'

export type UserState = {
	user?: User
	setUser: (user: User) => void
	clearUser: () => void
	getUser: () => User | undefined
}

export const useUserStore = create<UserState>()(
	devtools(
		persist(
			(set, get) => ({
				user: undefined,
				setUser: user => set({ user }),
				clearUser: () => set({ user: undefined }),
				getUser: () => get().user,
			}),
			{ name: 'userStore' }
		)
	)
)

export const setUser = useUserStore.getState().setUser
export const clearUser = useUserStore.getState().clearUser
export const getUser = useUserStore.getState().getUser

// export const actions = {
// 	setUser: useUserStore(state => state.setUser),
// 	clearUser: useUserStore(state => state.clearUser),
// 	getUser: useUserStore(state => state.getUser),
// } as const
