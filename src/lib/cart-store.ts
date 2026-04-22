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
    ram?: string
    stock?: number
    category?: string
    brand?: string
    promotions?: any[]
    selected?: boolean
}

interface CartStore {
    items: CartItem[]
    discount: {
        code: string
        type: 'PERCENTAGE' | 'FIXED'
        value: number
    } | null
    isCartOpen: boolean
    setCartOpen: (val: boolean) => void
    
    // Core Actions
    addItem: (product: any, userId?: string) => Promise<void>
    removeItem: (id: string, userId?: string) => Promise<void>
    updateQuantity: (id: string, qty: number, userId?: string) => Promise<void>
    clearCart: (userId?: string) => Promise<void>
    toggleItemSelection: (id: string) => void
    toggleSelectAll: () => void
    hydrateCart: () => Promise<void>
    
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
            isCartOpen: false,
            setCartOpen: (val) => set({ isCartOpen: val }),
            
            addItem: async (product, userId) => {
                const pId = product.id.toString()
                const existing = get().items.find((i) => i.id.toString() === pId)
                const currentQty = existing ? existing.quantity : 0
                const requestedAdd = product.quantity || 1
                
                const availableStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : Infinity
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
                            stock: availableStock,
                            selected: true
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

                const availableStock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : Infinity
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
            
            toggleItemSelection: (id: string) => {
                set({
                    items: get().items.map((i) => i.id === id ? { ...i, selected: i.selected === false ? true : false } : i)
                })
            },

            toggleSelectAll: () => {
                const items = get().items;
                const allSelected = items.every(i => i.selected !== false);
                set({
                    items: items.map(i => ({ ...i, selected: !allSelected }))
                });
            },

            hydrateCart: async () => {
                const current = get().items;
                if (current.length === 0) return;
                try {
                    const ids = Array.from(new Set(current.map(i => i.productId || i.id))).join(',');
                    const res = await fetch(`/api/products?ids=${ids}&limit=100`);
                    if (res.ok) {
                        const products = await res.json();
                        const updatedItems = current.map(item => {
                            const pId = item.productId || item.id;
                            const liveProduct = products.find((p: any) => p.id === pId);
                            if (!liveProduct) return null; // Product deleted
                            // Try to find the matching variant for price and stock safely
                            let resolvedPrice = liveProduct.price;
                            let resolvedStock = liveProduct.stock;
                            if (item.storage || item.ram) {
                                const variant = (liveProduct.variants || []).find((v: any) => 
                                    (item.storage ? String(v.storage) === String(item.storage) : true) && 
                                    (item.ram ? String(v.ram) === String(item.ram) : true)
                                );
                                if (variant) {
                                    if (Number(variant.price) > 0) resolvedPrice = Number(variant.price);
                                    if (variant.stock !== undefined && variant.stock !== null) resolvedStock = Number(variant.stock);
                                }
                            }
                            
                            // Re-apply dynamic discounts to the live price
                            const dbDiscount = Number(liveProduct.discount || 0);
                            const promoDiscount = (liveProduct.promotions || []).reduce((max: number, p: any) => p.type === 'PERCENTAGE' ? Math.max(max, Number(p.value) || 0) : max, 0);
                            const maxDiscount = Math.max(dbDiscount, promoDiscount);
                            if (maxDiscount > 0) {
                                resolvedPrice = Math.round(Number(resolvedPrice) * (1 - maxDiscount / 100));
                            }

                            return {
                                ...item,
                                price: Number(resolvedPrice),
                                stock: resolvedStock !== undefined && resolvedStock !== null ? Number(resolvedStock) : undefined,
                                name: item.name || liveProduct.name,
                                image: item.image || liveProduct.image,
                                promotions: liveProduct.promotions || []
                            };
                        }).filter(Boolean) as CartItem[];
                        set({ items: updatedItems });
                    }
                } catch (e) {
                    console.error("Hydrating cart failed", e);
                }
            },

            applyDiscount: (code, type, value) => set({ discount: { code, type, value } }),
            removeDiscount: () => set({ discount: null }),
            
            totalItems: () => get().items.filter(i => i.selected !== false).reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
            totalPrice: () => get().items.filter(i => i.selected !== false).reduce((acc: number, item: CartItem) => {
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
