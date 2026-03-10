import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image: string
    color?: string
    storage?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (product: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, qty: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const existing = get().items.find((i) => i.id === product.id)
                if (existing) {
                    set({
                        items: get().items.map((i) =>
                            i.id === product.id ? { ...i, quantity: i.quantity + product.quantity } : i
                        ),
                    })
                } else {
                    set({ items: [...get().items, product] })
                }
            },
            removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
            updateQuantity: (id, qty) =>
                set({
                    items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
                }),
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        { name: 'smarthub-cart' }
    )
)
