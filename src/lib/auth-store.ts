import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
    id: string
    email: string
    role: string
    displayName: string | null
}

interface AuthState {
    user: User | null
    setAuth: (user: User | null) => void
    logout: () => void
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setAuth: (user) => set({ user }),
            logout: () => set({ user: null })
        }),
        {
            name: 'smarthub-auth-storage',
        }
    )
)
