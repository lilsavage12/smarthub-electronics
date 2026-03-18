
/**
 * Utility to handle and apply promotions to product prices
 */

export type PromotionType = 'PERCENTAGE' | 'FIXED'
export type PromotionCategory = 'REGULAR' | 'FLASH_SALE' | 'DAILY_DEAL' | 'SEASONAL' | 'EXCLUSIVE'

export interface Promotion {
    id: string
    title: string
    type: PromotionType
    value: number
    category: PromotionCategory
    startDate: string
    endDate: string
    isActive: boolean
    priority: number
    saleStock?: number | null
    soldInPromo?: number
}

export function getEffectivePromotion(productPromotions: Promotion[]) {
    if (!productPromotions || productPromotions.length === 0) return null

    const now = new Date()
    
    // Filter active promotions
    const activePromos = productPromotions.filter(p => {
        const start = new Date(p.startDate)
        const end = new Date(p.endDate)
        const hasStock = p.saleStock === null || p.saleStock === undefined || (p.soldInPromo || 0) < p.saleStock
        return p.isActive && now >= start && now <= end && hasStock
    })

    if (activePromos.length === 0) return null

    // Sort by priority (desc) and then by value (desc)
    return activePromos.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority
        return b.value - a.value
    })[0]
}

export function calculateDiscountedPrice(originalPrice: number, promo: Promotion | null) {
    if (!promo) return { discountedPrice: originalPrice, savings: 0, percentOff: 0 }

    let discountedPrice = originalPrice
    let savings = 0
    let percentOff = 0

    if (promo.type === 'PERCENTAGE') {
        percentOff = promo.value
        savings = (originalPrice * promo.value) / 100
        discountedPrice = originalPrice - savings
    } else {
        savings = promo.value
        discountedPrice = originalPrice - savings
        percentOff = Math.round((savings / originalPrice) * 100)
    }

    return {
        discountedPrice: Math.max(0, discountedPrice),
        savings,
        percentOff
    }
}
