"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-store"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"

/**
 * SessionSyncProvider
 * Manages the global synchronization of user identity and sessions.
 * Individual data synchronization (Cart, Wishlist, Orders) is handled
 * at the store and page levels to ensure a clean source-of-truth.
 */
export const SessionSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, initialize } = useAuth()
    const { syncOnLogin: syncCart } = useCart()
    const { syncOnLogin: syncWishlist } = useWishlist()

    useEffect(() => {
        // Initialize Supabase Auth and Profile real-time listeners
        initialize()
    }, [initialize])

    useEffect(() => {
        if (user) {
            syncCart(user.id)
            syncWishlist(user.id)
        }
    }, [user, syncCart, syncWishlist])

    return <>{children}</>
}
