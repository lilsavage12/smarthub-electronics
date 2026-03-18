import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'

export interface WishlistItem {
    id: string
    productId: string
    userId: string
    product?: any 
}

interface WishlistStore {
    items: any[] // Full product objects
    isLoaded: boolean
    isSyncing: boolean
    
    // Actions
    toggleWishlist: (productId: string, userId?: string) => Promise<void>
    isInWishlist: (productId: string) => boolean
    syncOnLogin: (userId: string) => Promise<void>
    loadWishlist: (userId: string) => Promise<void>
    removeItem: (productId: string, userId?: string) => Promise<void>
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            isLoaded: false,
            isSyncing: false,
            
            toggleWishlist: async (productId, userId) => {
                const current = get().items
                const exists = current.some(i => (i.productId || i.id) === productId)
                
                // 1. Optimistic Update (IDs only if we don't have full data yet)
                if (exists) {
                    set({ items: current.filter(i => (i.productId || i.id) !== productId) })
                } else {
                    // For optimistic add, we might not have all details, but we add the ID
                    set({ items: [...current, { id: productId, productId }] })
                }

                // 2. Database Sync
                if (userId) {
                    try {
                        const method = exists ? 'DELETE' : 'POST'
                        const res = await fetch('/api/wishlist', {
                            method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, productId })
                        })
                        
                        if (res.ok) {
                            // Refresh to get full product objects
                            get().loadWishlist(userId)
                        }
                    } catch (error) {
                        set({ items: current })
                        toast.error("Wishlist sync failed")
                    }
                }
            },

            removeItem: async (productId, userId) => {
                await get().toggleWishlist(productId, userId)
            },
            
            isInWishlist: (productId) => get().items.some(i => (i.productId || i.id) === productId),
            
            loadWishlist: async (userId) => {
                if (!userId) return
                try {
                    const res = await fetch(`/api/wishlist?userId=${userId}`)
                    if (res.ok) {
                        const data = await res.json()
                        set({ items: data.items, isLoaded: true })
                    }
                } catch (error) {
                    console.error("Wishlist fetch failed:", error)
                }
            },

            syncOnLogin: async (userId) => {
                if (!userId || get().isSyncing) return
                
                set({ isSyncing: true })
                const localItems = get().items
                const localIds = localItems.map(i => i.productId || i.id)
                
                try {
                    const res = await fetch('/api/wishlist/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, items: localIds })
                    })
                    
                    if (res.ok) {
                        const data = await res.json()
                        set({ items: data.items, isLoaded: true })
                    }
                } catch (error) {
                    console.error("Wishlist sync failed:", error)
                } finally {
                    set({ isSyncing: false })
                }
            }
        }),
        {
            name: 'smarthub-wishlist-sync-v2',
            partialize: (state) => ({ items: state.items })
        }
    )
)
