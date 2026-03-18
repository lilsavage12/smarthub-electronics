import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'

export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    quantity: number
    image: string
    color?: string
    storage?: string
}

interface CartStore {
    items: CartItem[]
    isSyncing: boolean
    isLoaded: boolean
    
    // Core Actions
    addItem: (product: any, userId?: string) => Promise<void>
    removeItem: (id: string, userId?: string) => Promise<void>
    updateQuantity: (id: string, qty: number, userId?: string) => Promise<void>
    clearCart: (userId?: string) => Promise<void>
    
    // Sync Actions
    loadCart: (userId: string) => Promise<void>
    syncOnLogin: (userId: string) => Promise<void>
    
    // Computed
    totalItems: () => number
    totalPrice: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isSyncing: false,
            isLoaded: false,
            
            addItem: async (product, userId) => {
                const pId = product.productId || product.id
                const existing = get().items.find((i) => 
                    i.productId === pId && 
                    i.color === product.color && 
                    i.storage === product.storage
                )
                
                // 1. Optimistic Update
                if (existing) {
                    set({
                        items: get().items.map((i) =>
                            i.id === existing.id ? { ...i, quantity: i.quantity + (product.quantity || 1) } : i
                        ),
                    })
                } else {
                    const tempId = `temp-${Date.now()}`
                    set({ 
                        items: [...get().items, { 
                            ...product, 
                            id: tempId, 
                            productId: pId,
                            quantity: product.quantity || 1 
                        }] 
                    })
                }

                // 2. Persistent Sync (if logged in)
                if (userId) {
                    try {
                        const res = await fetch('/api/cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId,
                                productId: pId,
                                quantity: product.quantity || 1,
                                color: product.color,
                                storage: product.storage
                            })
                        })
                        if (!res.ok) throw new Error("Synchronization protocol failed")
                        
                        // Pull official IDs from server
                        get().loadCart(userId)
                    } catch (error) {
                        console.error('Cart Item Sync Error:', error)
                    }
                }
            },
            
            removeItem: async (id, userId) => {
                const originalItems = get().items
                set({ items: originalItems.filter((i) => i.id !== id) })
                
                if (userId) {
                    try {
                        const res = await fetch(`/api/cart?id=${id}&userId=${userId}`, {
                            method: 'DELETE'
                        })
                        if (!res.ok) throw new Error("Sync Failed")
                    } catch (error) {
                        set({ items: originalItems })
                        toast.error("Failed to sync item removal")
                    }
                }
            },
            
            updateQuantity: async (id, qty, userId) => {
                const originalItems = get().items
                if (qty <= 0) {
                    get().removeItem(id, userId)
                    return
                }

                set({
                    items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
                })

                if (userId) {
                    try {
                        const res = await fetch('/api/cart', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, id, quantity: qty })
                        })
                        if (!res.ok) throw new Error("Quantity Sync Failed")
                    } catch (error) {
                        set({ items: originalItems })
                        toast.error("Failed to sync quantity update")
                    }
                }
            },
            
            clearCart: async (userId) => {
                set({ items: [] })
                if (userId) {
                    try {
                        await fetch(`/api/cart?userId=${userId}`, { method: 'DELETE' })
                    } catch (error) {
                        console.error("Failed to clear cloud cart")
                    }
                }
            },
            
            loadCart: async (userId) => {
                if (!userId) return
                try {
                    const res = await fetch(`/api/cart?userId=${userId}`)
                    if (res.ok) {
                        const data = await res.json()
                        set({ items: data.items, isLoaded: true })
                    }
                } catch (error) {
                    console.error('Cloud load failed:', error)
                }
            },

            syncOnLogin: async (userId) => {
                if (!userId || get().isSyncing) return
                
                set({ isSyncing: true })
                const localItems = get().items
                
                try {
                    // Trigger the Merge Protocol on Server
                    const res = await fetch('/api/cart/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, items: localItems })
                    })
                    
                    if (res.ok) {
                        const data = await res.json()
                        // Use the server's truth (which is now merged)
                        set({ items: data.items, isLoaded: true })
                        toast.success("Cart synchronized with account")
                    }
                } catch (error) {
                    console.error('Account synchronization failed:', error)
                } finally {
                    set({ isSyncing: false })
                }
            },
            
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        }),
        { 
            name: 'smarthub-cart-sync',
            partialize: (state) => ({ items: state.items })
        }
    )
)
