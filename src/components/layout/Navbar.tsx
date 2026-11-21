"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export const Navbar = ({ initialSettings }: { initialSettings?: any }) => {
    const { totalItems, setCartOpen } = useCart()
    const [mounted, setMounted] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => { setMounted(true) }, [])
    useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

    const cartTotal = mounted ? totalItems() : 0

    return (
        <>
            {/* TOP BAR */}
            <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0c0c0e]/90 backdrop-blur-md border-b border-white/10">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">

                    {/* BRAND LOGO */}
                    <Link href="/" className="flex items-center tracking-tighter group">
                        <span className="font-black text-white text-xl tracking-tighter font-f1 group-hover:text-[#e10600] transition-colors">
                            F1GEAR
                        </span>
                        <span className="text-[#e10600] font-black text-xl mx-1.5 leading-none">|</span>
                        <span className="text-white/60 font-bold text-xs tracking-[0.2em] uppercase mt-0.5">KE</span>
                    </Link>

                    {/* CENTER LINKS */}
                    <nav className="hidden md:flex items-center gap-10">
                        <Link
                            href="/products"
                            className={cn(
                                "text-[11px] font-black uppercase tracking-[0.22em] transition-colors font-f1",
                                pathname === "/products" ? "text-white" : "text-white/50 hover:text-white"
                            )}
                        >
                            COLLECTION
                        </Link>
                        <Link
                            href="/shipping-and-return-policy"
                            className={cn(
                                "text-[11px] font-black uppercase tracking-[0.22em] transition-colors font-f1",
                                pathname === "/shipping-and-return-policy" ? "text-white" : "text-white/50 hover:text-white"
                            )}
                        >
                            DELIVERY
                        </Link>
                        <Link
                            href="/contact"
                            className={cn(
                                "text-[11px] font-black uppercase tracking-[0.22em] transition-colors font-f1",
                                pathname === "/contact" ? "text-white" : "text-white/50 hover:text-white"
                            )}
                        >
                            CONTACT
                        </Link>
                        <a
                            href="https://wa.me/254142656105"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-black uppercase tracking-[0.22em] text-[#00d4aa] hover:text-white transition-colors font-f1"
                        >
                            WHATSAPP
                        </a>
                    </nav>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-3">
                        {/* CART PILL BUTTON */}
                        <button
                            onClick={() => setCartOpen(true)}
                            className="flex items-center gap-2 border border-white/20 hover:border-[#e10600] px-3.5 py-1.5 transition-all text-white group cursor-pointer bg-black/40"
                        >
                            <ShoppingBag size={14} className="text-white/70 group-hover:text-[#e10600]" />
                            <span className="text-[11px] font-black uppercase tracking-widest font-f1">CART</span>
                            <span className="w-5 h-5 bg-[#e10600] text-white text-[10px] font-black flex items-center justify-center leading-none">
                                {cartTotal}
                            </span>
                        </button>

                        {/* MOBILE MENU TOGGLE */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-white/70 hover:text-white"
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE DRAWER */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-16 z-[99] dark:bg-[#0c0c0e] bg-white border-b dark:border-white/10 border-neutral-200 flex flex-col p-6 space-y-6 md:hidden">
                    <nav className="flex flex-col space-y-4">
                        <Link
                            href="/products"
                            className="text-lg font-black uppercase tracking-widest dark:text-white text-neutral-900 border-b dark:border-white/5 border-neutral-200 pb-3 font-f1"
                        >
                            COLLECTION
                        </Link>
                        <Link
                            href="/shipping-and-return-policy"
                            className="text-lg font-black uppercase tracking-widest dark:text-white text-neutral-900 border-b dark:border-white/5 border-neutral-200 pb-3 font-f1"
                        >
                            DELIVERY
                        </Link>
                        <Link
                            href="/contact"
                            className="text-lg font-black uppercase tracking-widest dark:text-white text-neutral-900 border-b dark:border-white/5 border-neutral-200 pb-3 font-f1"
                        >
                            CONTACT
                        </Link>
                        <a
                            href="https://wa.me/254142656105"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-black uppercase tracking-widest text-[#00d4aa] border-b border-white/10 pb-3 font-f1"
                        >
                            ORDER ON WHATSAPP (0142 656 105)
                        </a>
                    </nav>
                </div>
            )}

            {/* FLOATING WHATSAPP PILL */}
            <a
                href="https://wa.me/254142656105"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[90] bg-[#e10600] hover:bg-[#c90500] text-white px-5 py-3 rounded-full flex items-center gap-2.5 shadow-2xl transition-all duration-300 hover:scale-105 group font-f1"
            >
                <MessageCircle size={18} className="fill-white" />
                <span className="text-xs font-black uppercase tracking-[0.18em]">WHATSAPP US</span>
            </a>
        </>
    )
}
