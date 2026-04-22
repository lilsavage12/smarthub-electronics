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
    hydrateItems: () => Promise<void>
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            isLoaded: false,

            loadWishlist: async (userId: string) => {
                get().hydrateItems(); // Use hydrate instead of fake endpoint
            },
            
            hydrateItems: async () => {
                const current = get().items;
                const missingIds = current.filter(i => !i.name).map(i => i.productId || i.id);
                if (missingIds.length === 0) {
                    set({ isLoaded: true })
                    return;
                }
                
                try {
                    const res = await fetch(`/api/products?ids=${missingIds.join(',')}&limit=100`);
                    if (res.ok) {
                        const fetchedProducts = await res.json();
                        const hydratedItems = current.map(item => {
                            const match = fetchedProducts.find((p: any) => p.id === (item.productId || item.id));
                            if (match) return { ...(item.productId ? item : { productId: match.id, id: match.id }), ...match };
                            return item;
                        });
                        // Filter out items that still have no name (deleted products)
                        set({ items: hydratedItems.filter(i => i.name), isLoaded: true });
                    } else {
                        set({ isLoaded: true });
                    }
                } catch (err) {
                    console.error("Hydration failed", err);
                    set({ isLoaded: true });
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
