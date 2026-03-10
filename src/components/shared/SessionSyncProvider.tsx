"use client"

import { useEffect, useRef } from "react"
import { useCart } from "@/lib/cart-store"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"

export const SessionSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const { items: cartItems, clearCart, addItem } = useCart()
    const { user } = useAuth()
    const isInitialLoad = useRef(true)
    const prevCartRef = useRef(JSON.stringify(cartItems))

    // Sync state to backend (DB Persistence for cross-device sync)
    useEffect(() => {
        // Skip first effect run for loading
        if (isInitialLoad.current) return;

        const currentCartStr = JSON.stringify(cartItems)
        if (currentCartStr === prevCartRef.current) return;

        const syncSession = async () => {
            try {
                await fetch("/api/session/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cart: cartItems,
                    })
                })
                prevCartRef.current = currentCartStr
            } catch (error) {
                console.error("Sync Error:", error)
            }
        }

        const timeoutId = setTimeout(syncSession, 2000) // Debounce sync
        return () => clearTimeout(timeoutId)
    }, [cartItems])

    // Load initial state from backend (Hydrate from DB for cross-device sync)
    useEffect(() => {
        const loadSession = async () => {
            try {
                const res = await fetch("/api/session/sync")
                if (res.ok) {
                    const data = await res.json()

                    // If local cart is empty but DB has items, hydrate
                    if (cartItems.length === 0 && data.cart && data.cart.length > 0) {
                        data.cart.forEach((item: any) => addItem(item))
                        toast.success("Synchronized your cart from the cloud", {
                            icon: "☁️",
                            style: { fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }
                        })
                    }
                }
            } catch (error) {
                console.error("Load Error:", error)
            } finally {
                isInitialLoad.current = false
            }
        }
        loadSession()
    }, [])

    return <>{children}</>
}
