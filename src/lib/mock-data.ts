export const BRANDS = [
    { name: "Apple", logo: "🍎", slug: "apple" },
    { name: "Samsung", logo: "📱", slug: "samsung" },
    { name: "Xiaomi", logo: "MI", slug: "xiaomi" },
    { name: "Google", logo: "G", slug: "google" },
    { name: "OnePlus", logo: "1+", slug: "oneplus" },
    { name: "Tecno", logo: "T", slug: "tecno" },
]

export const PRODUCTS = [
    {
        id: "lumina-zx",
        name: "Lumina ZX Flagship",
        brand: "SmartHub",
        price: 1199,
        originalPrice: 1299,
        image: "/images/lumina_zx.png",
        rating: 4.9,
        reviews: 124,
        tags: ["New", "5G", "Flagship"],
        description: "The pinnacle of mobile engineering with a triple-lens system and celestial display.",
        specs: {
            display: '6.8" AMOLED 120Hz',
            processor: "Snapdragon 8 Gen 4",
            battery: "5500mAh",
            camera: "200MP Main"
        }
    },
    {
        id: "lumina-fold",
        name: "Aurora Fold Pro",
        brand: "SmartHub",
        price: 1799,
        originalPrice: 1999,
        image: "/images/lumina_fold.png",
        rating: 4.8,
        reviews: 86,
        tags: ["Foldable", "Premium"],
        description: "Unfold the future with the most durable flexible display ever made.",
        specs: {
            display: '7.6" Foldable AMOLED',
            processor: "Snapdragon 8 Gen 4",
            battery: "4800mAh",
            camera: "108MP Main"
        }
    },
    {
        id: "iphone-16-pro",
        name: "iPhone 16 Pro Max",
        brand: "Apple",
        price: 1299,
        image: "/images/lumina_zx.png", // Fallback for now
        rating: 4.9,
        reviews: 432,
        tags: ["Popular"],
        description: "Titanium design and A18 Pro chip for unparalleled performance.",
        specs: {
            display: '6.9" Super Retina XDR',
            processor: "A18 Pro",
            battery: "All-day",
            camera: "48MP Fusion"
        }
    },
    {
        id: "s24-ultra",
        name: "Galaxy S24 Ultra",
        brand: "Samsung",
        price: 1099,
        originalPrice: 1199,
        image: "/images/lumina_zx.png", // Fallback for now
        rating: 4.7,
        reviews: 215,
        tags: ["AI Powered", "5G"],
        description: "The ultimate AI-first smartphone experience with S-Pen support.",
        specs: {
            display: '6.8" Dynamic AMOLED',
            processor: "Snapdragon 8 Gen 3",
            battery: "5000mAh",
            camera: "200MP Pro-Grade"
        }
    }
]
