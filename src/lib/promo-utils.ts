
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
        const end = p.endDate ? new Date(p.endDate) : null
        const hasStock = p.saleStock === null || p.saleStock === undefined || (p.soldInPromo || 0) < p.saleStock
        const isActive = p.isActive && now >= start && (!end || now <= end) && hasStock
        
        if (p.isActive) {
            console.log(`[PROMO DIAGNOSTIC] Title: ${p.title} | Now: ${now.toISOString()} | Start: ${start.toISOString()} | End: ${end?.toISOString() || 'NULL'} | Active: ${isActive}`);
        }
        
        return isActive
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
        discountedPrice: Math.round(Math.max(0, discountedPrice)),
        savings: Math.round(savings),
        percentOff: Math.round(percentOff)
    }
}

/**
 * Calculates the average unit price for a given quantity target, 
 * factoring in limited promotional stock (Mixed Pricing Model).
 */
export function calculateMixedPrice(originalPrice: number, quantity: number, promo: any | null) {
    if (!promo || quantity <= 0) return originalPrice

    const saleStock = promo.saleStock
    const soldInPromo = promo.soldInPromo || 0
    const remainingInPromo = (saleStock !== null && saleStock !== undefined) 
        ? Math.max(0, saleStock - soldInPromo) 
        : Infinity
    
    // Units that get the discount
    const discountedQty = Math.min(quantity, remainingInPromo)
    // Units at full price
    const fullPriceQty = Math.max(0, quantity - discountedQty)
    
    // Calculate single unit discount
    const { discountedPrice } = calculateDiscountedPrice(originalPrice, promo)
    
    // Return average price for the cart line item
    const totalLinePrice = (discountedQty * discountedPrice) + (fullPriceQty * originalPrice)
    return Number((totalLinePrice / quantity).toFixed(2))
}

export function calculateFinalPrice(originalPrice: number, promos: any[] = []) {
    const promo = getEffectivePromotion(promos)
    const { discountedPrice } = calculateDiscountedPrice(originalPrice, promo)
    return discountedPrice
}
