"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
    Search, ShoppingCart, User, Heart, Menu, X, Smartphone,
    Globe, Briefcase, Zap, ArrowLeftRight, Truck, LayoutDashboard,
    Package, Settings, LogOut, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useAuth } from "@/lib/auth-store"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useComparison } from "@/lib/comparison-store"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"

export const Navbar = () => {
    const { totalItems: cartItemsCount, loadCart, isLoaded: cartLoaded, syncOnLogin: syncCart } = useCart()
    const { items: wishlistItems, syncOnLogin: syncWishlist, loadWishlist } = useWishlist()
    const { items: comparisonItems } = useComparison()
    const { user, logout, isInitialized: authInitialized } = useAuth()
    
    const cartTotal = typeof cartItemsCount === 'function' ? cartItemsCount() : 0
    const wishlistTotal = wishlistItems?.length || 0
    const comparisonTotal = comparisonItems.length
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Close profile dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Close profile dropdown on navigation
    useEffect(() => {
        setIsProfileOpen(false)
    }, [pathname])

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Synchronize Cart on Auth Change or Mount
    useEffect(() => {
        if (mounted && user) {
            // Priority: Sync local items to server first, then reload
            const performSync = async () => {
                await syncCart(user.id)
                await syncWishlist(user.id)
            }
            performSync()
        } else if (mounted && !user) {
            // Guest mode: loadCart handles local persistence automatically if userId is missing
            // but we don't have a specific load guest action, it's just state.
        }
    }, [user?.id, mounted])

    const navLinks = [
        { name: "Collection", href: "/products" },
        { name: "Track", href: "/track-order" },
        { name: "Trade-In", href: "/trade-in" },
        { name: "Support", href: "/contact" },
    ]

    return (
        <nav
            className={cn(
                "sticky top-0 left-0 right-0 z-50 transition-all duration-500 w-full",
                isScrolled 
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3 shadow-sm" 
                    : "bg-background border-b border-transparent py-5"
            )}
            suppressHydrationWarning
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-10">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group shrink-0 relative">
                    <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="bg-primary p-2 rounded-xl"
                    >
                        <Smartphone className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tighter text-foreground uppercase italic leading-none">
                            Smart<span className="text-primary italic">Hub</span>
                        </span>
                        <span className="text-[7px] font-black tracking-[0.3em] uppercase text-muted-foreground leading-none mt-1 opacity-50">Advanced Electronics</span>
                    </div>
                </Link>

                {/* Main Nav Items - Desktop */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="relative group py-2"
                        >
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                                pathname === link.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                {link.name}
                            </span>
                            {/* Animated Underline */}
                            <span className={cn(
                                "absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 rounded-full",
                                pathname === link.href ? "w-full" : "group-hover:w-full"
                            )} />
                        </Link>
                    ))}
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-3">
                    {/* Search Bar - Sophisticated Toggle */}
                    <div className="hidden md:flex items-center relative gap-2">
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.form
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 240, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                                        if (query) router.push(`/products?search=${encodeURIComponent(query)}`);
                                    }}
                                    className="relative"
                                >
                                    <input
                                        autoFocus
                                        name="search"
                                        type="text"
                                        placeholder="SEARCH CATALOG..."
                                        className="w-full bg-accent/50 border border-border/50 rounded-full pl-4 pr-10 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Search className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={cn("rounded-full transition-all", isSearchOpen && "bg-accent")}
                        >
                            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-accent/30 p-1 rounded-full border border-border/10">
                        {/* Comparison */}
                        <Link href="/compare">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative group">
                                <ArrowLeftRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                {mounted && comparisonTotal > 0 && (
                                    <span className="absolute top-1 right-1 bg-primary text-[8px] font-black text-primary-foreground min-w-[15px] h-[15px] flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                                        {comparisonTotal}
                                    </span>
                                )}
                            </Button>
                        </Link>
                        
                        {/* Wishlist */}
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative group">
                                <Heart className="w-4 h-4 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                                {mounted && wishlistTotal > 0 && (
                                    <span className="absolute top-1 right-1 bg-rose-500 text-[8px] font-black text-white min-w-[15px] h-[15px] flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                                        {wishlistTotal}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* Cart */}
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative group">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                {mounted && cartTotal > 0 && (
                                    <span className="absolute top-1 right-1 bg-primary text-[8px] font-black text-primary-foreground min-w-[15px] h-[15px] flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in shadow-lg shadow-primary/20">
                                        {cartTotal}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        {mounted && user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={cn(
                                        "flex items-center gap-2 py-1.5 pl-1.5 pr-3 border border-border rounded-full transition-all hover:bg-primary/5 active:scale-95 group",
                                        isProfileOpen && "border-primary/30 bg-primary/5"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-black uppercase ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                                        {user.displayName?.charAt(0) || user.email.charAt(0)}
                                    </div>
                                    <div className="hidden lg:flex flex-col text-left">
                                        <span className="text-[9px] font-black uppercase tracking-widest leading-none max-w-[80px] truncate">{user.displayName || user.email.split('@')[0]}</span>
                                        <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] italic leading-none mt-1">My Account</span>
                                    </div>
                                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-300", isProfileOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute right-0 mt-3 w-56 bg-card/80 backdrop-blur-2xl border border-border rounded-[1.5rem] shadow-2xl shadow-primary/10 p-2 z-[60]"
                                        >
                                            <div className="px-4 py-3 border-b border-border/50 mb-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground truncate">{user.displayName || "User"}</p>
                                                <p className="text-[8px] font-medium text-muted-foreground truncate lowercase">{user.email}</p>
                                            </div>

                                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group/item">
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
                                            </Link>
                                            <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group/item">
                                                <Package className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">My Orders</span>
                                            </Link>
                                            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group/item">
                                                <Settings className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
                                            </Link>
                                            
                                            <div className="h-px bg-border/50 my-1 mx-2" />
                                            
                                            <button 
                                                onClick={logout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all group/item"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Sign Out</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : mounted && !user && (
                            <Link href="/login">
                                <Button className="h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-transform">
                                    <User className="w-3.5 h-3.5 mr-2" />
                                    Login
                                </Button>
                            </Link>
                        )}

                        <div className="hidden lg:block">
                            <ThemeToggle />
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-full h-10 w-10 ml-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                        <X className="w-5 h-5 text-primary" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                        <Menu className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Premium Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border overflow-hidden z-40"
                    >
                        <div className="p-8 flex flex-col gap-6">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-2xl font-black uppercase tracking-tighter italic flex items-center justify-between group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="group-hover:text-primary transition-colors">{link.name}</span>
                                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary transition-all">
                                            <ArrowLeftRight className="w-4 h-4 group-hover:text-primary-foreground group-hover:rotate-180 transition-all duration-500" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                            
                            <div className="pt-8 border-t border-border flex flex-col gap-4">
                                {user ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link href="/dashboard" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic" variant="outline">
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic" variant="destructive">
                                            Sign Out
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic" variant="outline">Sign In</Button>
                                        </Link>
                                        <Link href="/register" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">Join Now</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
