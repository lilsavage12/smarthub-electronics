import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'
import { calculateFinalPrice } from './promo-utils'

export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    originalPrice: number
    quantity: number
    image: string
    color?: string
    storage?: string
    stock?: number
    promotions?: any[]
}

interface CartStore {
    items: CartItem[]
    discount: {
        code: string
        type: 'PERCENTAGE' | 'FIXED'
        value: number
    } | null
    
    // Core Actions
    addItem: (product: any, userId?: string) => Promise<void>
    removeItem: (id: string, userId?: string) => Promise<void>
    updateQuantity: (id: string, qty: number, userId?: string) => Promise<void>
    clearCart: (userId?: string) => Promise<void>
    
    // Discount Actions
    applyDiscount: (code: string, type: 'PERCENTAGE' | 'FIXED', value: number) => void
    removeDiscount: () => void
    
    // Computed
    totalItems: () => number
    totalPrice: () => number
    discountedTotal: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            discount: null,
            
            addItem: async (product, userId) => {
                const pId = product.id.toString()
                const existing = get().items.find((i) => i.id.toString() === pId)
                const currentQty = existing ? existing.quantity : 0
                const requestedAdd = product.quantity || 1
                
                const availableStock = product.stock !== undefined ? product.stock : Infinity
                if (currentQty + requestedAdd > availableStock) {
                    const message = availableStock <= 0 
                        ? `ASSET OUT OF SYNC: NO UNITS AVAILABLE.`
                        : `Only ${availableStock} items available in stock.`
                    
                    toast.error(message, {
                        style: { background: '#EF4444', color: '#fff', borderRadius: '16px', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }
                    })
                    return
                }

                if (existing) {
                    const newQty = existing.quantity + requestedAdd
                    set({
                        items: get().items.map((i) =>
                            i.id.toString() === pId ? { ...i, quantity: newQty } : i
                        ),
                    })
                } else {
                    set({ 
                        items: [...get().items, { 
                            ...product, 
                            productId: product.productId || product.id,
                            price: product.price,
                            originalPrice: product.originalPrice || product.price,
                            quantity: requestedAdd,
                            stock: availableStock
                        }] 
                    })
                }
            },
            
            removeItem: async (id, userId) => {
                const originalItems = get().items
                set({ items: originalItems.filter((i) => i.id !== id) })
            },
            
            updateQuantity: async (id, qty, userId) => {
                const originalItems = get().items
                const item = originalItems.find(i => i.id === id)
                if (!item) return

                if (qty <= 0) {
                    get().removeItem(id, userId)
                    return
                }

                const availableStock = item.stock !== undefined ? item.stock : Infinity
                if (qty > availableStock) {
                    const message = availableStock <= 0 
                        ? `ASSET OUT OF SYNC: NO UNITS AVAILABLE.`
                        : `Only ${availableStock} items available in stock.`
                    
                    toast.error(message, {
                         style: { background: '#EF4444', color: '#fff', borderRadius: '16px', fontSize: '10px', fontWeight: 'black' }
                    })
                    return
                }

                set({
                    items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
                })
            },
            
            clearCart: async (userId) => {
                set({ items: [], discount: null })
            },
            
            applyDiscount: (code, type, value) => set({ discount: { code, type, value } }),
            removeDiscount: () => set({ discount: null }),
            
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => {
                const itemPrice = calculateFinalPrice(item.price, item.promotions)
                return acc + (itemPrice * item.quantity)
            }, 0),
            discountedTotal: () => {
                const base = get().totalPrice()
                const d = get().discount
                if (!d) return base
                if (d.type === 'PERCENTAGE') return base * (1 - d.value / 100)
                return Math.max(0, base - d.value)
            }
        }),
        { 
            name: 'smarthub-cart-sync',
            partialize: (state) => ({ items: state.items, discount: state.discount })
        }
    )
)
