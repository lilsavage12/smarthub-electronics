"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X, Minus, Plus, ArrowRight, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { toast } from "react-hot-toast"

export function CartDrawer() {
    const { 
        items, 
        removeItem, 
        updateQuantity, 
        totalPrice, 
        totalItems,
        toggleItemSelection, 
        toggleSelectAll, 
        clearCart,
        isCartOpen, 
        setCartOpen 
    } = useCart()

    const rawTotal = totalPrice()
    const selectedCount = items.filter(i => i.selected !== false).length
    const allSelected = items.length > 0 && selectedCount === items.length

    if (!isCartOpen) return null

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Sidebar Drawer */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative h-full w-full max-w-[480px] bg-[#101012] border-l border-white/10 flex flex-col z-10"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={18} className="text-[#e10600]" />
                        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">
                            YOUR BAG ({items.reduce((acc, i) => acc + (i.quantity || 1), 0)})
                        </h2>
                    </div>
                    <button
                        onClick={() => setCartOpen(false)}
                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Bag Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                            <ShoppingBag size={48} className="text-white/10" />
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30">Your bag is empty</p>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="mt-3 bg-[#e10600] text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3.5 hover:bg-[#c90500] transition-colors"
                            >
                                EXPLORE COLLECTION
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <div className="flex flex-col gap-6">
                                {/* Select All Controls Bar */}
                                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50">
                                    <label className="flex items-center gap-2.5 cursor-pointer hover:text-white select-none">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="accent-[#e10600] w-4 h-4 cursor-pointer rounded"
                                        />
                                        <span>SELECT ALL ({selectedCount}/{items.length})</span>
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => clearCart()} 
                                        className="hover:text-[#e10600] transition-colors"
                                    >
                                        CLEAR ALL
                                    </button>
                                </div>

                                {items.map((item) => {
                                    const isSelected = item.selected !== false
                                    return (
                                        <div 
                                            key={item.id + (item.variant || '')} 
                                            className={`flex gap-3 group pb-6 border-b border-white/5 transition-opacity ${isSelected ? "opacity-100" : "opacity-45"}`}
                                        >
                                            {/* Item Selection Checkbox */}
                                            <div className="flex items-center pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                    className="accent-[#e10600] w-4 h-4 cursor-pointer rounded"
                                                />
                                            </div>

                                            {/* Product Thumbnail */}
                                            <div className="w-20 h-24 bg-white/5 border border-white/10 shrink-0 relative overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="96px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                                                            {item.brand || 'SCUDERIA FERRARI'}
                                                        </span>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-white/20 hover:text-[#e10600] transition-colors"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                    <h4 className="text-xs font-black uppercase tracking-tight text-white mt-1 line-clamp-1">
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-white/50 tracking-wider">
                                                            SIZE {item.variant || 'L'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    {/* Stepper */}
                                                    <div className="flex items-center border border-white/15 bg-black/40">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white"
                                                        >
                                                            <Minus size={10} />
                                                        </button>
                                                        <span className="w-7 text-center text-xs font-black text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.stock !== undefined && item.stock !== null && item.quantity >= Number(item.stock)}
                                                            className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>

                                                    <span className="text-xs font-black text-white tracking-wide">
                                                        Ksh {Math.round(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Checkout */}
                {items.length > 0 && (
                    <div className="p-8 border-t border-white/10 bg-[#0c0c0e] flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">
                                SUBTOTAL ({selectedCount} {selectedCount === 1 ? 'ITEM' : 'ITEMS'})
                            </span>
                            <span className="text-xl font-black text-white tracking-tight">
                                Ksh {Math.round(rawTotal).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-[10px] text-white/35 leading-relaxed">
                            Exclusive of delivery fees — we'll confirm the fee with you on WhatsApp before dispatch.
                        </p>

                        {selectedCount > 0 ? (
                            <Link
                                href="/checkout"
                                onClick={() => setCartOpen(false)}
                                className="bg-[#e10600] text-white text-[11px] font-black uppercase tracking-[0.22em] h-12 flex items-center justify-center gap-2 hover:bg-[#c90500] transition-colors mt-2"
                            >
                                CHECKOUT ({selectedCount}) <ArrowRight size={14} />
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="bg-white/10 text-white/30 text-[11px] font-black uppercase tracking-[0.22em] h-12 flex items-center justify-center gap-2 cursor-not-allowed mt-2"
                            >
                                SELECT ITEMS TO CHECKOUT
                            </button>
                        )}
                        <button
                            onClick={() => setCartOpen(false)}
                            className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40 hover:text-white transition-colors h-9 flex items-center justify-center"
                        >
                            CONTINUE SHOPPING
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
