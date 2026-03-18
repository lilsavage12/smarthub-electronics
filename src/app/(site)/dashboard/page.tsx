"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    Package, Truck, CheckCircle, Heart, ChevronRight,
    Loader2, ShoppingBag, Clock, ArrowUpRight, Star
} from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { useWishlist } from "@/lib/wishlist-store"
import { useCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { supabase } from "@/lib/supabase"

interface Order {
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
    items: any[]
}

export default function CustomerDashboard() {
    const { user, isInitialized } = useAuth()
    const router = useRouter()
    const { items: wishlistItems, loadWishlist, syncOnLogin: syncWishlist } = useWishlist()
    const { loadCart, syncOnLogin: syncCart } = useCart()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        if (!user) return
        try {
            const res = await fetch(`/api/orders?userId=${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isInitialized) return

        if (!user) {
            router.push("/login")
            return
        }

        // 1. Load Stores from Server (Source of Truth)
        syncWishlist(user.id)
        syncCart(user.id)

        // 2. Initial Fetch
        fetchOrders()

        // 3. Real-time Subscription for Instant Updates
        const channel = supabase
            .channel('dashboard-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Order',
                    filter: `userId=eq.${user.id}`
                },
                () => {
                    console.log('Order change detected, refreshing...')
                    fetchOrders()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, router, loadWishlist, loadCart])

    if (!user) return null

    const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length
    const shippedOrders = orders.filter(o => o.status === "SHIPPED").length
    const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    const stats = [
        {
            label: "Total Orders",
            value: orders.length,
            icon: Package,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            border: "border-blue-100 dark:border-blue-500/20"
        },
        {
            label: "In Progress",
            value: pendingOrders + shippedOrders,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "border-amber-100 dark:border-amber-500/20"
        },
        {
            label: "Delivered",
            value: deliveredOrders,
            icon: CheckCircle,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            border: "border-emerald-100 dark:border-emerald-500/20"
        },
        {
            label: "Wishlist",
            value: wishlistItems.length,
            icon: Heart,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-500/10",
            border: "border-rose-100 dark:border-rose-500/20"
        }
    ]

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
            PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
            SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
            DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
            CANCELLED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
        }
        return styles[status] || "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400"
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: "Pending",
            PROCESSING: "Processing",
            SHIPPED: "Shipped",
            DELIVERED: "Delivered",
            CANCELLED: "Cancelled"
        }
        return labels[status] || status
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                        Welcome back, {user.displayName?.split(" ")[0] || "there"}!
                    </h1>
                    <p className="text-muted-foreground">
                        Here's a quick overview of your account.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={cn(
                                "bg-card border rounded-2xl p-5 hover:shadow-md transition-all duration-200",
                                stat.border
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Total Spent Banner */}
                {orders.length > 0 && (
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                            <p className="text-3xl font-bold tracking-tight">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary fill-primary" />
                            <span className="text-sm font-medium text-primary">
                                {orders.length >= 10 ? "VIP Customer" : orders.length >= 5 ? "Loyal Customer" : "Welcome!"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors group"
                    >
                        <Package className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">View All Orders</span>
                        <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                    <Link
                        href="/dashboard/wishlist"
                        className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors group"
                    >
                        <Heart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">My Wishlist</span>
                        <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors group"
                    >
                        <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Shop Now</span>
                        <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-lg font-bold">Recent Orders</h2>
                        {orders.length > 0 && (
                            <Link
                                href="/dashboard/orders"
                                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    <div>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="font-semibold mb-1">No orders yet</p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Start shopping to see your orders here.
                                </p>
                                <Link
                                    href="/"
                                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Browse Products
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {orders.slice(0, 5).map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/dashboard/orders/${order.id}`}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                                            {/* Order image preview */}
                                            <div className="relative w-12 h-12 flex-shrink-0 rounded-xl bg-accent overflow-hidden">
                                                {order.items[0]?.image ? (
                                                    <Image
                                                        src={order.items[0].image}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2.5 mb-1">
                                                    <span className="font-semibold text-sm">#{order.orderNumber}</span>
                                                    <span className={cn(
                                                        "text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                                                        getStatusBadge(order.status)
                                                    )}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>
                                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric", year: "numeric"
                                                        })}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <span className="font-bold text-sm">
                                                ${order.totalAmount.toFixed(2)}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
