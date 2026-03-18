import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export interface User {
    id: string
    email: string
    role: string
    displayName: string | null
    profileId?: string // Bridge for legacy accounts
}

interface AuthState {
    user: User | null
    isInitialized: boolean
    setAuth: (user: User | null) => void
    logout: () => Promise<void>
    initialize: () => Promise<void>
    refreshProfile: () => Promise<void>
}

export const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isInitialized: false,
            
            setAuth: (user) => set({ user }),
            
            logout: async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                await supabase.auth.signOut()
                set({ user: null })
            },

            refreshProfile: async () => {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    // 1. Try User table (CUID/Email bridge) instead of failing 'profiles' table
                    const { data: profile } = await supabase
                        .from('User')
                        .select('*')
                        .eq('email', session.user.email)
                        .maybeSingle()

                    if (profile) {
                        const newUser = {
                            id: session.user.id, // CRITICAL: Use Supabase UUID for session persistence
                            email: profile.email,
                            role: profile.role || 'USER',
                            displayName: profile.displayName,
                            profileId: profile.id // Legacy CUID reference
                        }
                        set({ user: newUser })
                        
                        // 2. MISSION CRITICAL: Cross-Device State Sync
                        const { useCart } = await import('./cart-store')
                        const { useWishlist } = await import('./wishlist-store')
                        
                        // Async handshake to avoid blocking auth render
                        useCart.getState().syncOnLogin(newUser.id)
                        useWishlist.getState().syncOnLogin(newUser.id)
                        
                    } else {
                        // Fallback: Use minimal auth user data
                        set({
                            user: {
                                id: session.user.id,
                                email: session.user.email || '',
                                role: 'USER',
                                displayName: session.user.user_metadata?.display_name || null
                            }
                        })
                    }
                }
            },

            initialize: async () => {
                if (get().isInitialized) return

                try {
                    // Always try to refresh on init to ensure source of truth
                    await get().refreshProfile()

                    // Listen for changes
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        if (session?.user) {
                            await get().refreshProfile()
                        } else if (event === 'SIGNED_OUT') {
                            set({ user: null })
                        }
                    })

                    // Real-time profile updates
                    if (get().user) {
                        supabase
                            .channel(`profile-${get().user?.id}`)
                            .on(
                                'postgres_changes',
                                {
                                    event: 'UPDATE',
                                    schema: 'public',
                                    table: 'profiles',
                                    filter: `id=eq.${get().user?.id}`
                                },
                                () => {
                                    console.log('Profile updated in DB, syncing...')
                                    get().refreshProfile()
                                }
                            )
                            .subscribe()
                    }
                } catch (error) {
                    console.error("Auth initialization failed:", error)
                } finally {
                    set({ isInitialized: true })
                }
            }
        }),
        {
            name: 'smarthub-auth-storage',
            partialize: (state) => ({ user: state.user })
        }
    )
)
