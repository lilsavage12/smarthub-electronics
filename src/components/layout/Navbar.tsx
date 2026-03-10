"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
    Search, ShoppingCart, User, Heart, Menu, X, Smartphone,
    Globe, Briefcase, Zap, ArrowLeftRight, Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useAuth } from "@/lib/auth-store"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useComparison } from "@/lib/comparison-store"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export const Navbar = () => {
    const { totalItems: cartTotal } = useCart()
    const { totalItems: wishlistTotal } = useWishlist()
    const { items: comparisonItems } = useComparison()
    const { user, logout } = useAuth()
    const comparisonTotal = comparisonItems.length
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Shop", href: "/products", icon: <Smartphone className="w-4 h-4" /> },
        { name: "Track Order", href: "/track-order", icon: <Truck className="w-4 h-4" /> },
        { name: "Partners", href: "/partners", icon: <Briefcase className="w-4 h-4" /> },
        { name: "Trade-In", href: "/trade-in", icon: <Zap className="w-4 h-4" /> },
    ]

    return (
        <nav
            className={cn(
                "sticky top-0 left-0 right-0 z-50 transition-all duration-300 w-full px-6 md:px-12 bg-background border-b border-border py-4"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="bg-primary p-1.5 rounded-lg group-hover:scale-105 transition-all duration-300">
                        <Smartphone className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-black text-lg tracking-tighter text-foreground uppercase italic leading-none">
                        Smart<span className="text-primary italic">Hub</span>
                    </span>
                </Link>

                {/* Desktop Navigation - Centered */}
                <div className="hidden lg:flex items-center justify-center flex-1 gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors italic"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center relative group">
                        <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                            if (query) router.push(`/products?search=${encodeURIComponent(query)}`);
                        }}>
                            <input
                                name="search"
                                type="text"
                                placeholder="SEARCH..."
                                className="bg-muted border border-border/50 focus:border-primary/30 rounded-lg pl-9 pr-4 py-2 text-[9px] font-black w-40 lg:w-48 outline-none transition-all focus:w-60 uppercase tracking-widest placeholder:opacity-50"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-border">
                            <Link href="/compare">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary relative transition-transform hover:scale-110">
                                    <ArrowLeftRight className="w-4 h-4" />
                                    {mounted && comparisonTotal > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-[8px] font-black text-primary-foreground min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-background">
                                            {comparisonTotal}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                            <Link href="/wishlist">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary relative transition-transform hover:scale-110">
                                    <Heart className="w-4 h-4" />
                                    {mounted && wishlistTotal() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-[8px] font-black text-primary-foreground min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-background">
                                            {wishlistTotal()}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary relative transition-transform hover:scale-110">
                                    <ShoppingCart className="w-4 h-4" />
                                    {mounted && cartTotal() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-[8px] font-black text-primary-foreground min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-background">
                                            {cartTotal()}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            {mounted && user ? (
                                <div className="hidden sm:flex items-center gap-3 bg-muted/50 rounded-full pr-3 pl-1 py-1 mr-2 border border-border">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-black uppercase">
                                        {user.displayName?.charAt(0) || user.email.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none max-w-[80px] truncate">{user.displayName || user.email.split('@')[0]}</span>
                                    <button onClick={logout} className="text-muted-foreground hover:text-red-500 transition-colors ml-1">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : mounted && !user && (
                                <Link href="/login" className="hidden sm:flex mr-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary relative transition-transform hover:scale-110">
                                        <User className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}

                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-8 w-8"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 shadow-2xl flex flex-col gap-4"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-[11px] font-black uppercase tracking-[0.2em] py-3 border-b border-border/50 flex items-center justify-between group"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                                <ArrowLeftRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
                            </Link>
                        ))}
                        <div className="pt-4 flex items-center gap-3">
                            {user ? (
                                <Button onClick={logout} className="w-full text-[9px] font-black uppercase tracking-widest italic" variant="outline">
                                    Sign Out
                                </Button>
                            ) : (
                                <>
                                    <Link href="/login" className="flex-1">
                                        <Button className="w-full text-[9px] font-black uppercase tracking-widest italic" variant="outline">Sign In</Button>
                                    </Link>
                                    <Link href="/register" className="flex-1">
                                        <Button className="w-full text-[9px] font-black uppercase tracking-widest italic">Join Now</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
