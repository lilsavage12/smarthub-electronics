/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE.
 * User-specific cart synchronization is no longer active.
 */
"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-store"
import { useCart } from "@/lib/cart-store"

export default function CartSyncProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const { loadCart, syncOnLogin: syncCart, items } = useCart()

    useEffect(() => {
        if (user?.id) {
            loadCart(user.id)
        }
    }, [user?.id])

    useEffect(() => {
        if (user?.id && items.length > 0) {
            const syncTimer = setTimeout(() => {
                syncCart(user.id)
            }, 1000)
            
            return () => clearTimeout(syncTimer)
        }
    }, [user?.id, items])

    return <>{children}</>
}

