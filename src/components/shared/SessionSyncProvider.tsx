"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-store"

/**
 * SessionSyncProvider
 * Manages the global synchronization of user identity and sessions.
 * Individual data synchronization (Cart, Wishlist, Orders) is handled
 * at the store and page levels to ensure a clean source-of-truth.
 */
export const SessionSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const { initialize } = useAuth()
    useEffect(() => {
        // Initialize Supabase Auth and Profile real-time listeners
        initialize()
    }, [initialize])

    return <>{children}</>
}
