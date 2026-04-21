"use client"

import React from "react"
import { TrustBar } from "./sections/TrustBar"
import { CategoryGrid } from "./sections/CategoryGrid"
import { ProductSection } from "./sections/ProductSection"
import { BrandShowcase } from "./sections/BrandShowcase"
import { PromoBanner } from "./sections/PromoBanner"
import { HeroSection } from "./sections/HeroSection"
import { FlashDeals } from "./sections/FlashDeals"
import { Sparkles, TrendingUp, Star, Box, Smartphone, Zap } from "lucide-react"

const SECTION_COMPONENTS: Record<string, any> = {
    hero: HeroSection,
    trust_bar: TrustBar,
    categories: CategoryGrid,
    featured_products: ProductSection,
    promo_banner: PromoBanner,
    brand_showcase: BrandShowcase,
    flash_deals: FlashDeals
}

const SECTION_ICONS: Record<string, any> = {
    newArrivals: Box,
    featured: Star,
    trending: TrendingUp,
    smartphones: Smartphone
}

export function SectionRenderer({
    section,
    allProducts,
    cmsData
}: {
    section: any,
    allProducts: any[],
    cmsData: any
}) {
    const Component = SECTION_COMPONENTS[section.type]
    if (!Component) return null

    // Prepare props based on type
    const props: any = { ...section.config }

    switch (section.type) {
        case "hero":
            props.banners = cmsData.banners || []
            break
        case "flash_deals":
            props.title = section.title || "Flash Deals"
            props.icon = Zap
            props.products = allProducts.filter(p => (Number(p.discount) > 0 || p.isSale)).slice(0, section.config?.limit || 10)
            break
        case "trust_bar":
            // Local items override global data
            const trustSource = section.config?.items || cmsData.trust || []
            props.items = trustSource.length > 0 ? trustSource : [
                { id: "ft-1", title: "Fast Delivery", subtitle: "Worldwide Shipping", icon: "Truck", isActive: true },
                { id: "ft-2", title: "Secure Pay", subtitle: "100% Protection", icon: "ShieldCheck", isActive: true },
                { id: "ft-3", title: "24/7 Support", subtitle: "Expert Help", icon: "Phone", isActive: true },
                { id: "ft-4", title: "Authentic", subtitle: "Genuine Gear", icon: "Activity", isActive: true }
            ]
            break
        case "categories":
            // Filter by selected IDs if present
            let cats = cmsData.categories || []
            if (section.config?.selectedCategories?.length > 0) {
                cats = cats.filter((c: any) => section.config.selectedCategories.includes(c.id))
            }
            props.categories = cats
            props.title = section.title || "Shop By Category"
            break
        case "brand_showcase":
            // Use global brands if selectedBrands is present, otherwise look for local config
            let brandList = cmsData.brands || []
            if (section.config?.selectedBrands?.length > 0) {
                brandList = brandList.filter((b: any) => section.config.selectedBrands.includes(b.id))
            } else if (section.config?.brands?.length > 0) {
                brandList = section.config.brands
            }

            props.brands = brandList.length > 0 ? brandList : [
                { id: "fb-1", title: "Apple", imageUrl: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png", isActive: true },
                { id: "fb-2", title: "Samsung", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png", isActive: true }
            ]
            // Normalize title/name
            props.brands = props.brands.map((b: any) => ({ ...b, title: b.title || b.name }))
            props.title = section.title || "SHOP BY BRANDS"
            break;
        case "featured_products":
            props.title = section.title || "Featured Collection"
            props.icon = SECTION_ICONS[section.config?.iconType] || Sparkles
            // Filter products based on source/rules
            let filtered = allProducts

            // Apply source filter
            if (section.config?.source === "featured") {
                // Best Sellers / Hot
                filtered = allProducts.filter(p => p.isHot || p.isFeatured)
            }
            else if (section.config?.source === "new") {
                // New Releases
                filtered = allProducts.filter(p => p.isNew)
            }
            else if (section.config?.source === "brand" || section.config?.brandName) {
                const targetBrand = section.config?.brandName || section.config?.source
                filtered = allProducts.filter(p => String(p.brand).toLowerCase() === String(targetBrand).toLowerCase())
            }
            else if (section.config?.source === "category" || section.config?.categoryName) {
                const targetCat = section.config?.categoryName || section.config?.source
                filtered = allProducts.filter(p => String(p.category).toLowerCase() === String(targetCat).toLowerCase())
            }
            else if (section.config?.source === "discounts") {
                filtered = allProducts.filter(p => p.discountPercentage > 0)
            }

            props.products = filtered.slice(0, section.config?.limit || 10)

            // Pass integrated banner if enabled
            if (section.config?.showBanner) {
                props.banner = {
                    image: section.config.bannerImage,
                    title: section.config.bannerTitle,
                    subtitle: section.config.bannerSubtitle
                }
            }
            break
        case "promo_banner":
            // Provide default if missing image
            props.imageUrl = section.config?.imageUrl || "https://images.unsplash.com/photo-1556656793-062ff9f1b7e2?auto=format"
            props.title = section.config?.title || "Limited Edition"
            props.subtitle = section.config?.subtitle || "Premium Quality"
            props.link = section.config?.link || "/products"
            break
    }

    return (
        <div id={section.type} className="w-full">
            <Component {...props} />
        </div>
    )
}
