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
    // Actions
    toggleWishlist: (productOrId: any, userId?: string) => Promise<void>
    isLoaded: boolean
    isInWishlist: (productId: string) => boolean
    removeItem: (productId: string, userId?: string) => Promise<void>
    loadWishlist: (userId: string) => Promise<void>
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            isLoaded: false,

            loadWishlist: async (userId: string) => {
                if (!userId) return
                try {
                    const res = await fetch(`/api/wishlist?userId=${userId}`)
                    if (res.ok) {
                        const data = await res.json()
                        set({ items: data, isLoaded: true })
                    }
                } catch (err) {
                    console.error("Wishlist sync failed", err)
                    set({ isLoaded: true })
                }
            },
            
            toggleWishlist: async (productOrId: any, userId?: string) => {
                const productId = typeof productOrId === 'string' ? productOrId : (productOrId.id || productOrId.productId).toString()
                const current = get().items
                const exists = current.some(i => (i.productId || i.id).toString() === productId)
                
                // 1. Optimistic Update (Store full object if provided)
                if (exists) {
                    set({ items: current.filter(i => (i.productId || i.id).toString() !== productId) })
                } else {
                    const newItem = typeof productOrId === 'object' ? productOrId : { id: productId, productId }
                    set({ items: [...current, newItem] })
                }

            },

            removeItem: async (productId, userId) => {
                await get().toggleWishlist(productId, userId)
            },
            
            isInWishlist: (productId) => get().items.some(i => (i.productId || i.id).toString() === productId.toString()),
            
        }),
        {
            name: 'smarthub-wishlist-sync-v2',
            partialize: (state) => ({ items: state.items })
        }
    )
)
