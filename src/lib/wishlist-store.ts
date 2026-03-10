import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
    id: string
    name: string
    price: number
    image: string
}

interface WishlistStore {
    items: WishlistItem[]
    addItem: (product: WishlistItem) => void
    removeItem: (id: string) => void
    isInWishlist: (id: string) => boolean
    clearWishlist: () => void
    totalItems: () => number
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const exists = get().items.some((i) => i.id === product.id)
                if (!exists) {
                    set({ items: [...get().items, product] })
                }
            },
            removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
            isInWishlist: (id) => get().items.some((i) => i.id === id),
            clearWishlist: () => set({ items: [] }),
            totalItems: () => get().items.length,
        }),
        { name: 'smarthub-wishlist' }
    )
)
