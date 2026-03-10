import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
    id: string
    name: string
    image: string
    price: number
    brand: string
    specs?: {
        processor?: string
        ram?: string
        storage?: string
        battery?: string
        screen?: string
        camera?: string
    }
}

interface ComparisonStore {
    items: Product[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    clear: () => void
    isInComparison: (productId: string) => boolean
}

export const useComparison = create<ComparisonStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items
                if (items.find((item) => item.id === product.id)) return
                if (items.length >= 4) return // Max 4 products for comparison
                set({ items: [...items, product] })
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) })
            },
            clear: () => set({ items: [] }),
            isInComparison: (productId) => {
                return get().items.some((item) => item.id === productId)
            },
        }),
        {
            name: 'smarthub-comparison-storage',
        }
    )
)
