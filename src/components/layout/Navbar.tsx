"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import NextImage from "next/image"
import {
    Search, ShoppingCart, User, Heart, Menu, X, Smartphone,
    Zap, ArrowLeftRight, LayoutDashboard,
    Package, Settings, LogOut, ChevronDown, Bell, HelpCircle,
    Monitor, Laptop, Watch, Headphones, Gamepad2, HardDrive,
    Tablet, Camera, Speaker, ChevronRight, Grid, Sparkles, TrendingUp, ShieldCheck,
    Activity, Clock, MapPin, CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useAuth } from "@/lib/auth-store"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"

export const Navbar = () => {
    const { totalItems: cartItemsCount } = useCart()
    const { items: wishlistItems } = useWishlist()
    const { user, logout } = useAuth()
    
    const [cmsSettings, setCmsSettings] = useState<any>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const lastScrollRef = useRef(0)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    
    const router = useRouter()
    const pathname = usePathname()
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch Storefront Settings (CMS)
    useEffect(() => {
        const fetchCms = async () => {
            try {
                const res = await fetch("/api/cms/homepage")
                if (res.ok) {
                    const data = await res.json()
                    setCmsSettings(data.settings)
                }
            } catch (err) {
                console.error("Failed to load storefront settings")
            }
        }
        fetchCms()
    }, [])

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            setIsScrolled(currentScrollY > 20)
            
            const isMobile = window.innerWidth < 1024
            if (!isMobile && currentScrollY > lastScrollRef.current && currentScrollY > 150) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }
            lastScrollRef.current = currentScrollY
            setLastScrollY(currentScrollY)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsProfileOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        setIsProfileOpen(false)
        setActiveDropdown(null)
    }, [pathname])

    const cartTotal = typeof cartItemsCount === "function" ? cartItemsCount() : 0
    const wishlistTotal = wishlistItems?.length || 0

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/?search=${encodeURIComponent(searchQuery)}`)
            setSearchQuery("")
            setIsMobileMenuOpen(false)
        }
    }

    return (
        <>
            <div 
                className={cn(
                    "w-full fixed top-0 z-[100] transition-all duration-700 ease-in-out",
                    isVisible ? "translate-y-0" : "-translate-y-full"
                )}
                suppressHydrationWarning
            >


            {/* 2. NAVIGATION OVERLAY (TOP NAV) */}
            <nav 
                className={cn(
                    "w-full transition-all duration-500 bg-background",
                    isScrolled 
                        ? "backdrop-blur-2xl border-b border-border/50 py-2 shadow-xl shadow-black/5" 
                        : "py-3 md:py-6"
                )}
                suppressHydrationWarning
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-4 md:gap-6" suppressHydrationWarning>
                    
                    {/* MAIN MENU */}
                    <div className="flex items-center justify-between gap-4 md:gap-8" suppressHydrationWarning>
                        
                        {/* LEFT: BRANDING */}
                        <div className="flex items-center gap-3 min-w-0" suppressHydrationWarning>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="lg:hidden h-11 w-11 rounded-xl bg-primary/5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shrink-0 flex items-center justify-center shadow-lg shadow-primary/5"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                            
                            <Link href="/" className="flex items-center gap-2 group shrink-0">
                                {cmsSettings?.logoUrl && (
                                    <div className="transition-transform group-hover:rotate-6 group-hover:scale-110" suppressHydrationWarning={true}>
                                        <div className="relative w-10 h-10">
                                            <NextImage src={cmsSettings.logoUrl} alt="Logo" fill className="object-contain" />
                                        </div>
                                    </div>
                                )}
                                {cmsSettings?.storeName && (
                                    <div className="flex flex-col leading-[0.8] py-1" suppressHydrationWarning>
                                        <span className="font-black text-lg tracking-tighter text-foreground px-0">
                                            {cmsSettings.storeName.split(' ')[0]}
                                        </span>
                                        {cmsSettings.storeName.split(' ').length > 1 && (
                                            <span className="font-black text-[10px] tracking-tight text-primary mt-0.5">
                                                {cmsSettings.storeName.split(' ').slice(1).join(' ')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        </div>

                        {/* CENTER: DISCOVERY (DESKTOP) */}
                        {cmsSettings?.searchShow !== false && (
                            <form 
                                onSubmit={handleSearch}
                                className="hidden lg:flex flex-1 max-w-xl group relative"
                                suppressHydrationWarning
                            >
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" suppressHydrationWarning>
                                    <Search className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={cmsSettings?.searchPlaceholder || "SEARCH OUR STORE..."}
                                    className="w-full h-12 bg-muted/20 border-border/40 border rounded-xl pl-12 pr-28 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary/20 placeholder:text-muted-foreground/60 italic shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-focus-within:block animate-in fade-in zoom-in duration-300" suppressHydrationWarning>
                                    <Button type="submit" size="sm" className="h-8 px-4 rounded-lg bg-primary text-[9px] font-black italic uppercase tracking-widest shadow-lg shadow-primary/20">Search</Button>
                                </div>
                            </form>
                        )}

                        {/* RIGHT: UTILITIES */}
                        <div className="flex items-center gap-2 md:gap-4 shrink-0" suppressHydrationWarning>
                            <div className="hidden md:flex items-center gap-1.5 bg-muted/20 p-1 rounded-xl border border-border/5" suppressHydrationWarning>
                                <Link href="/wishlist">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg relative group hover:bg-white hover:shadow-lg dark:hover:bg-muted/80">
                                        <Heart className="w-4.5 h-4.5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                                        {mounted && wishlistTotal > 0 && (
                                            <span className="absolute top-1 right-1 bg-rose-500 text-[7px] font-black text-white min-w-[15px] h-[15px] flex items-center justify-center rounded-full border-2 border-background shadow-lg scale-110">
                                                {wishlistTotal}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                                <ThemeToggle />
                            </div>

                            <Link href="/cart">
                                <Button className="h-11 md:h-12 px-3 md:px-6 rounded-xl bg-foreground text-background font-black italic tracking-widest uppercase text-[9px] md:text-[10px] hover:bg-primary hover:text-white transition-all gap-2 shadow-xl shadow-black/5 relative group">
                                    <ShoppingCart className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                                    <span className="hidden sm:inline">Cart</span>
                                    {mounted && cartTotal > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-[9px] font-black text-primary-foreground min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-background shadow-2xl animate-in bounce-in">
                                            {cartTotal}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                        </div>
                    </div>

                    {/* PROFESSIONAL HORIZONTAL NAVIGATION (MEGA MENU) */}
                    <div className="hidden lg:block border-t border-border/10 mt-2" suppressHydrationWarning>
                        <div className="flex items-center gap-1" suppressHydrationWarning>
                            {(() => {
                                const links = JSON.parse(cmsSettings?.navbarLinks || "[]")
                                // Fallback categories if product list is empty
                                const displayLinks = links.length > 0 ? links : [
                                    { name: "Samsung", href: "/products?brands=Samsung" },
                                    { name: "Apple", href: "/products?brands=Apple" },
                                    { name: "Smartphones", href: "/products?categories=Smartphones" },
                                    { name: "Mobile Accessories", href: "/products?categories=Accessories" },
                                    { name: "Audio", href: "/products?categories=Audio" },
                                    { name: "Gaming", href: "/products?categories=Gaming" },
                                    { name: "Storage", href: "/products?categories=Storage" },
                                    { name: "Tablets", href: "/products?categories=Tablets" },
                                ]

                                return displayLinks.map((cat: any) => {
                                    const subLinks = cat.subLinks || []

                                    return (
                                        <div 
                                            key={cat.name}
                                            className="relative group/nav"
                                            onMouseEnter={() => setActiveDropdown(cat.name)}
                                            onMouseLeave={() => setActiveDropdown(null)}
                                            suppressHydrationWarning
                                        >
                                            <Link
                                                href={cat.href}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-5 py-4 text-[11px] font-medium uppercase tracking-widest transition-all relative",
                                                    activeDropdown === cat.name ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"
                                                )}
                                            >
                                                {cat.name}
                                                <div className={cn(
                                                    "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                                                    activeDropdown === cat.name ? "w-full" : "w-0"
                                                )} suppressHydrationWarning />
                                            </Link>

                                            {/* MEGA MENU DROPDOWN */}
                                            <AnimatePresence>
                                                {activeDropdown === cat.name && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                        className="absolute top-full left-0 mt-0 pt-0 z-[500]"
                                                    >
                                                         <div className="bg-background border border-border/40 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden min-w-[220px] p-2 mt-2 relative z-[600]">
                                                             <div className="flex flex-col gap-0.5">
                                                                 {/* Dynamic Sub-Links for the category */}
                                                                 {subLinks.map((sub: any) => (
                                                                     <Link 
                                                                         key={sub.name} 
                                                                         href={sub.href} 
                                                                         className="group/subitem flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-foreground hover:text-primary px-4 py-2.5 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all italic"
                                                                     >
                                                                         {sub.name}
                                                                         <ChevronRight size={12} className="opacity-0 -translate-x-2 group-hover/subitem:opacity-100 group-hover/subitem:translate-x-0 transition-all text-primary" />
                                                                     </Link>
                                                                 ))}
                                                                 {subLinks.length === 0 && (
                                                                     <div className="text-[8px] font-black uppercase opacity-20 text-center py-4 italic tracking-widest">Standalone Catalog</div>
                                                                 )}
                                                             </div>
                                                         </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })
                            })()}
                        </div>
                    </div>
                </div>
            </nav>

            </div>
            
            {/* 3. MOBILE SIDE DRAWER (LEFT OVERLAY) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[1000]"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 h-full w-[85%] max-w-[340px] bg-background border-r border-border z-[1010] overflow-y-auto no-scrollbar rounded-r-[2rem]"
                        >
                            <div className="p-8 flex flex-col h-full gap-10">
                                <div className="flex items-center justify-between">
                                    <Link href="/" className="flex items-center gap-3 group shrink-0" suppressHydrationWarning>
                                        {cmsSettings?.logoUrl && (
                                            <div className="transition-transform group-hover:rotate-3 group-hover:scale-110" suppressHydrationWarning={true}>
                                                <div className="relative w-10 h-10">
                                                    <NextImage src={cmsSettings.logoUrl} alt="Logo" fill className="object-contain" />
                                                </div>
                                            </div>
                                        )}
                                        {cmsSettings?.storeName && (
                                            <div className="flex flex-col leading-[0.8] py-1">
                                                <span className="font-black text-xl md:text-2xl tracking-tighter text-foreground px-0">
                                                    {cmsSettings.storeName.split(' ')[0]}
                                                </span>
                                                {cmsSettings.storeName.split(' ').length > 1 && (
                                                    <span className="font-black text-[11px] md:text-[13px] tracking-tight text-primary opacity-90 mt-0.5">
                                                        {cmsSettings.storeName.split(' ').slice(1).join(' ')}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* MOBILE SEARCH */}
                                {cmsSettings?.searchShow !== false && (
                                    <form onSubmit={handleSearch} className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            className="w-full h-12 bg-muted/20 border-border/40 border rounded-xl pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary/20 placeholder:text-muted-foreground/60 italic"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </form>
                                )}

                                    <div className="flex flex-col gap-8">
                                        <div className="flex flex-col gap-2" suppressHydrationWarning>
                                            <span className="text-[9px] font-black uppercase text-primary tracking-[0.3em] mb-4 italic px-2">Shop Categories</span>
                                            {(() => {
                                                const links = JSON.parse(cmsSettings?.navbarLinks || "[]")
                                                const displayLinks = links.length > 0 ? links : [
                                                    { name: "Samsung", href: "/products?brands=Samsung" },
                                                    { name: "Apple", href: "/products?brands=Apple" },
                                                    { name: "Smartphones", href: "/products?categories=Smartphones" },
                                                    { name: "Audio", href: "/products?categories=Audio" },
                                                    { name: "Logistics", href: "/track-order" },
                                                ]

                                                return displayLinks.map((cat: any, i: number) => {
                                                    const subLinks = cat.subLinks || []
                                                    const isExpanded = expandedMobileCategory === cat.name
                                                    const href = cat.href || "#"

                                                    return (
                                                        <motion.div key={cat.name} initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <Link
                                                                        href={href}
                                                                        className="flex-1 text-xl font-black uppercase tracking-tighter italic py-3.5 px-3 rounded-l-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                    >
                                                                        {cat.name}
                                                                    </Link>
                                                                    <button 
                                                                        onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.name)}
                                                                        className={cn(
                                                                            "p-3.5 rounded-r-xl transition-all border-l border-border/10",
                                                                            isExpanded ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                                        )}
                                                                    >
                                                                        <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isExpanded && "rotate-90")} />
                                                                    </button>
                                                                </div>
                                                                
                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="overflow-hidden border-l-2 border-primary/20 ml-6 mt-1 flex flex-col gap-1"
                                                                        >
                                                                            {subLinks.map((sub: any) => (
                                                                                <Link 
                                                                                    key={sub.name}
                                                                                    href={sub.href}
                                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                                    className="py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 hover:text-primary transition-colors italic border-l border-primary/20 bg-primary/5 rounded-r-xl mt-1"
                                                                                >
                                                                                    {sub.name}
                                                                                </Link>
                                                                            ))}
                                                                            {subLinks.length === 0 && (
                                                                                <div className="py-4 px-6 text-[8px] font-black uppercase opacity-20 italic">Standalone Catalog</div>
                                                                            )}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })
                                            })()}
                                        </div>
                                    <div className="mt-auto flex flex-col gap-3">
                                    </div>
                                    <div className="flex items-center justify-center gap-6 py-6 border-t border-border mt-6">
                                        <ThemeToggle />
                                        <div className="w-[1px] h-5 bg-border" />
                                        <Link 
                                            href="/contact"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-muted-foreground hover:text-primary transition-colors text-[10px] font-black uppercase"
                                        >
                                            Support
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
