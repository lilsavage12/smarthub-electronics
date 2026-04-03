/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User Dashboard and related synchronization functionality have been detached.
 * Relocated from original path for easy restoration.
 */
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
    Package, Heart, MapPin,
    ChevronRight, Activity, Clock, ShieldCheck,
    CreditCard, Bell, Smartphone, ShoppingCart, 
    ArrowUpRight, TrendingUp, Zap, Box, 
    Monitor, CheckCircle2, History, Star, ShoppingBag, Eye
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useCart } from "@/lib/cart-store"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { cn } from "@/lib/utils"

export default function UserDashboard() {
    const { user } = useAuth()
    const { items: wishlist } = useWishlist()
    const { totalItems } = useCart()
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const cartCount = typeof totalItems === 'function' ? totalItems() : totalItems || 0
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const inProgressCount = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length
    const deliveredCount = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length

    const statCards = [
        { label: "Total Orders", value: orders.length, icon: Box, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
        { label: "Delivered", value: deliveredCount, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Wishlist", value: wishlist.length, icon: Heart, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    ]

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id && !user?.email) return
            try {
                const params = new URLSearchParams()
                if (user.id) params.append("userId", user.id)
                if (user.email) params.append("email", user.email)
                
                const res = await fetch(`/api/orders?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data)
                }
            } catch (err) {
                console.error("Fetch Error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrders()
    }, [user?.id, user?.email])

    if (!user) return null

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                
                {/* 1. WELCOME HEADER */}
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Welcome back, {user.displayName?.split(' ')[0] || 'Operative'}!</h2>
                    <p className="text-muted-foreground mt-1 font-medium tracking-tight">Here&apos;s a quick overview of your account.</p>
                </div>

                {/* 2. STATS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, i) => (
                        <Card key={i} className={cn("p-6 border bg-card flex flex-col justify-between h-48 rounded-[2rem] transition-all hover:shadow-xl hover:shadow-black/5", card.border)}>
                            <div className={cn("inline-flex p-3 rounded-2xl w-fit", card.bg)}>
                                <card.icon className={cn("w-5 h-5", card.color)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-black tracking-tighter italic">{card.value}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{card.label}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* 3. TOTAL SPENT BANNER */}
                <Card className="p-8 bg-muted/40 border-border/50 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    <div className="flex flex-col gap-2 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Total Spent</span>
                        <span className="text-4xl md:text-5xl font-black tracking-tighter italic text-foreground leading-none">
                            KSh {Math.round(totalSpent).toLocaleString()}
                        </span>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-colors" />
                </Card>

                {/* 4. QUICK ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/orders">
                        <Button variant="outline" className="w-full h-16 rounded-2xl border-border/50 bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest italic gap-3">
                            <Package size={18} /> View All Orders
                        </Button>
                    </Link>
                    <Link href="/wishlist">
                        <Button variant="outline" className="w-full h-16 rounded-2xl border-border/50 bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest italic gap-3">
                            <Heart size={18} /> My Wishlist
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="w-full h-16 rounded-2xl border-border/50 bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest italic gap-3">
                            <ShoppingBag size={18} /> Shop Now
                        </Button>
                    </Link>
                </div>

                {/* 5. RECENT ORDERS REGISTRY */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight italic uppercase">Recent Orders</h3>
                        <Link href="/dashboard/orders" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    <Card className="rounded-[2.5rem] border-border/50 bg-card/40 overflow-hidden divide-y divide-border/20">
                        {isLoading ? (
                            <div className="py-24 flex items-center justify-center">
                                <Activity className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center text-center gap-6 opacity-20 transition-all hover:opacity-40">
                                <Box size={40} />
                                <p className="text-[10px] font-black uppercase tracking-widest">No order history detected.</p>
                            </div>
                        ) : (
                            orders.slice(0, 5).map((order) => (
                                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block group">
                                    <div className="p-6 flex items-center justify-between hover:bg-muted/50 transition-all">
                                        <div className="flex items-center gap-6 min-w-0">
                                            <div className="h-16 w-16 relative bg-muted rounded-[1.25rem] overflow-hidden shrink-0">
                                                {order.items?.[0]?.image ? (
                                                    <img src={order.items[0].image} alt="" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Box className="w-6 h-6 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black tracking-tight uppercase truncate">
                                                        #{order.orderNumber || order.id.slice(-8)}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[8px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest",
                                                        order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground/60 tracking-tight uppercase">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.items?.length || 0} items
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-lg font-black tracking-tighter italic">KSh {Math.round(order.totalAmount).toLocaleString()}</span>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

