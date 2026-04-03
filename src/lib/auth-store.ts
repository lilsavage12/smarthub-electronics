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
    isRefreshing: boolean
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
            isRefreshing: false,
            
            setAuth: (user) => set({ user }),
            
            logout: async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                await supabase.auth.signOut()
                set({ user: null })
            },

            refreshProfile: async () => {
                // If we're already refreshing, don't trigger another one
                if (get().isRefreshing) return
                
                set({ isRefreshing: true })
                try {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                    
                    if (sessionError) {
                        console.error("[AUTH] Session error during refresh:", sessionError)
                        // Don't log out yet, it might be a temporary network issue
                        return
                    }

                    if (session?.user) {
                        const { data: profile } = await supabase
                            .from('User')
                            .select('*')
                            .eq('email', session.user.email)
                            .maybeSingle()

                        const newUser = {
                            id: session.user.id,
                            email: session.user.email || profile?.email || '',
                            role: profile?.role || 'USER',
                            displayName: profile?.displayName || null,
                            profileId: profile?.id
                        }
                        set({ user: newUser })
                    } else {
                        // Only clear user if we are explicitly sure there's no session
                        // and we are NOT in the middle of an initialization
                        if (get().isInitialized) {
                            console.warn("[AUTH] No session found, clearing user state")
                            set({ user: null })
                        }
                    }
                } catch (err) {
                    console.error("Auth refresh failed:", err)
                    // Be conservative: don't clear user on caught exceptions to avoid accidental kickouts
                } finally {
                    set({ isRefreshing: false })
                }
            },

            initialize: async () => {
                if (get().isInitialized) return

                try {
                    // Try to restore user from session
                    await get().refreshProfile()

                    // Listen for changes
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        console.log(`[AUTH_EVENT] ${event}`)
                        if (session?.user) {
                            if (session.access_token) {
                                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax; Secure`
                            }
                            await get().refreshProfile()
                        } else if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
                            document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                            set({ user: null })
                        }
                    })

                    // Periodic Session Safety Check (every 30 minutes)
                    // Reduced frequency to minimize disruption while ensuring token stays alive
                    setInterval(() => {
                        console.log("[AUTH] Periodic session refresh check...")
                        const currentUser = get().user
                        if (currentUser) {
                            get().refreshProfile()
                        }
                    }, 30 * 60 * 1000)

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
