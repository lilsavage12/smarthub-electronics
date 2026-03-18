"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    Package, Search, Loader2, Filter, ChevronRight,
    Calendar, ArrowUpDown, SlidersHorizontal, AlertCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Order {
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
    items: any[]
}

export default function MyOrders() {
    const { user, isInitialized } = useAuth()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")

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

        fetchOrders()

        // Real-time updates
        const channel = supabase
            .channel('orders-page')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Order',
                    filter: `userId=eq.${user.id}`
                },
                () => {
                    console.log('Order change detected on orders page, refreshing...')
                    fetchOrders()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, router])

    if (!user) return null

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20"
            case "PROCESSING":
                return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
            case "SHIPPED":
                return "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border-purple-200 dark:border-purple-500/20"
            case "DELIVERED":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
            case "CANCELLED":
                return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-200 dark:border-red-500/20"
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400 border-gray-200 dark:border-gray-500/20"
        }
    }

    const statuses = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">My Orders</h1>
                        <p className="text-muted-foreground">
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed in total
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Order number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="rounded-xl shrink-0">
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border shrink-0",
                                statusFilter === status
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                            )}
                        >
                            {status === "ALL" ? "All" : status}
                        </button>
                    ))}
                </div>

                {/* Orders Grid */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Loading your history...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-card border border-border border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center">
                                <Package className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <div className="max-w-xs">
                                <h3 className="text-xl font-bold mb-2">No orders found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm || statusFilter !== "ALL" 
                                        ? "Try searching for something else or adjusting your filters." 
                                        : "You haven't placed any orders yet. Start shopping to fill this space!"}
                                </p>
                            </div>
                            <Link href="/">
                                <Button className="rounded-xl px-8 uppercase tracking-widest text-[10px] font-black italic">
                                    Browse Shop
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/dashboard/orders/${order.id}`}
                                    className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                                >
                                    <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Package className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-lg">#{order.orderNumber}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase px-3 py-0.5 rounded-full border",
                                                        getStatusStyles(order.status)
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric", year: "numeric"
                                                        })}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{order.items.length} {order.items.length === 1 ? "Item" : "Items"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end gap-8 bg-accent/30 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Total Amount</p>
                                                <p className="text-xl font-bold">${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>

                                    {/* Order items preview */}
                                    <div className="px-5 sm:px-6 py-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="relative w-14 h-14 rounded-lg bg-accent border border-border/50 shrink-0 overflow-hidden group-hover:border-primary/30 transition-colors">
                                                {item.image ? (
                                                    <Image src={item.image} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">ITEM</div>
                                                )}
                                                {item.quantity > 1 && (
                                                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 5 && (
                                            <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0 border border-border/50">
                                                +{order.items.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Card */}
                {!loading && orders.length > 0 && (
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider leading-relaxed text-muted-foreground">
                            Orders are processed within 24 hours. For any inquiries regarding your order status or shipping, please contact our <Link href="/contact" className="text-primary hover:underline italic">support team</Link>.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
