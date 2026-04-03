"use client"

import React, { useState, useEffect } from "react"
import {
    ShoppingCart, Download, Package, Smartphone, AlertTriangle,
    RefreshCw, CreditCard, Tag, ShieldCheck, ChevronRight,
    TrendingUp, Star, MessageSquare, Bell, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"

export default function DashboardOverview() {
    const [liveOrders, setLiveOrders] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [discounts, setDiscounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState("7 Days")
    const router = useRouter()

    const fetchData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers: any = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            console.log("Dashboard: Starting data fetch...")
            const [ordersRes, productsRes, discountsRes] = await Promise.all([
                fetch("/api/orders", { headers }),
                fetch("/api/products", { headers }),
                fetch("/api/discounts", { headers })
            ])

            if (ordersRes.ok) {
                const data = await ordersRes.json()
                setLiveOrders(Array.isArray(data) ? data : [])
            } else {
                console.error("Orders fetch failed:", ordersRes.statusText)
            }

            if (productsRes.ok) {
                const data = await productsRes.json()
                setProducts(Array.isArray(data) ? data : [])
            }

            if (discountsRes.ok) {
                const data = await discountsRes.json()
                setDiscounts(Array.isArray(data) ? data : [])
            }

        } catch (error) {
            console.error("Dashboard Data Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    // Filtered Data based on timeRange
    const getFilteredOrders = () => {
        const now = new Date()
        let cutoff = new Date()
        if (timeRange === "7 Days") cutoff.setDate(now.getDate() - 7)
        else if (timeRange === "30 Days") cutoff.setDate(now.getDate() - 30)
        else if (timeRange === "1 Year") cutoff.setFullYear(now.getFullYear() - 1)
        
        return liveOrders.filter(o => new Date(o.createdAt) >= cutoff)
    }

    const filteredOrders = getFilteredOrders()

    // KPI Calculations
    const today = new Date().toISOString().split('T')[0]
    const ordersToday = liveOrders.filter(o => o.createdAt && typeof o.createdAt === 'string' && o.createdAt.startsWith(today)).length
    const totalRevenue = filteredOrders.filter(o => o.paymentStatus === 'Paid' && o.status !== 'Cancelled').reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
    const phonesSold = filteredOrders.reduce((acc, o) => {
        const phoneItems = o.items?.filter((i: any) => 
            i.name && (i.name.toLowerCase().includes('iphone') || 
            i.name.toLowerCase().includes('galaxy') || 
            i.name.toLowerCase().includes('phone'))
        ) || []
        return acc + phoneItems.reduce((sum: number, i: any) => sum + (parseInt(i.quantity) || 0), 0)
    }, 0)
    const lowStockAlerts = (products || []).filter(p => p.stock < 10).length
    const returnsCount = filteredOrders.filter(o => o.status === 'RETURNED').length
    const pendingPayments = liveOrders.filter(o => o.paymentStatus !== 'Paid' && o.status !== 'Cancelled').reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)

    const activeCoupons = (discounts || []).filter(d => d.status === 'Active').length
    const totalSaved = (discounts || []).reduce((acc, d) => acc + ((parseInt(d.usedCount) || 0) * (parseFloat(d.value) || 0)), 0)
    const totalRedemptions = (discounts || []).reduce((acc, d) => acc + (parseInt(d.usedCount) || 0), 0)

    // Brand Affinity
    const brandSales: Record<string, number> = {}
    filteredOrders.forEach(o => {
        o.items?.forEach((item: any) => {
            const product = (products || []).find(p => p.id === item.productId)
            const brand = product?.brand || "Other"
            brandSales[brand] = (brandSales[brand] || 0) + (parseInt(item.quantity) || 0)
        })
    })

    const totalUnits = Object.values(brandSales).reduce((acc, v) => acc + v, 0)
    const affinityData = Object.entries(brandSales)
        .map(([name, units]) => ({ name, percentage: totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0 }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 4)

    const chartData = Array.from({ 
        length: timeRange === '7 Days' ? 7 : (timeRange === '30 Days' ? 30 : 12) 
    }).map((_, i) => {
        const d = new Date()
        if (timeRange === '7 Days') {
            d.setDate(d.getDate() - (6 - i))
            const dateStr = d.toISOString().split('T')[0]
            const revenue = liveOrders.filter(o => o.createdAt && typeof o.createdAt === 'string' && o.createdAt.startsWith(dateStr))
                .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
            return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue }
        } else if (timeRange === '30 Days') {
            d.setDate(d.getDate() - (29 - i))
            const dateStr = d.toISOString().split('T')[0]
            const revenue = liveOrders.filter(o => o.createdAt && typeof o.createdAt === 'string' && o.createdAt.startsWith(dateStr))
                .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
            return { name: d.getDate().toString(), revenue } // Show day number
        } else {
            d.setMonth(d.getMonth() - (11 - i))
            const monthStr = d.toISOString().slice(0, 7) // YYYY-MM
            const revenue = liveOrders.filter(o => o.createdAt && typeof o.createdAt === 'string' && o.createdAt.startsWith(monthStr))
                .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
            return { name: d.toLocaleDateString('en-US', { month: 'short' }), revenue }
        }
    })

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase leading-none">Dashboard Overview</h1>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-none mt-2">Welcome back, <span className="text-primary italic">Administrator</span>. Here's your dashboard snapshot.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
                        {['7 Days', '30 Days', '1 Year'].map(p => (
                            <button 
                                key={p} 
                                onClick={() => setTimeRange(p)}
                                className={cn("px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", p === timeRange ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    
                </div>
            </div>

            {/* Top Stat Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: `KSh ${Math.round(totalRevenue).toLocaleString()}`, icon: <TrendingUp size={16} />, sub: "", color: "" },
                    { label: "Devices Sold", value: phonesSold.toLocaleString(), icon: <Smartphone size={16} />, sub: "", color: "text-muted-foreground" },
                    { label: "Low Stock Alerts", value: lowStockAlerts.toString(), icon: <AlertTriangle size={16} />, sub: "CRITICAL", color: "text-destructive" },
                    { label: "Pending Payments", value: `KSh ${Math.round(pendingPayments).toLocaleString()}`, icon: <CreditCard size={16} />, sub: "EXPIRING", color: "text-muted-foreground" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-muted rounded-lg text-primary">{stat.icon}</div>
                            {stat.sub && <span className={cn("text-[9px] font-black uppercase tracking-widest", stat.color)}>{stat.sub}</span>}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{stat.label}</span>
                            <span className="text-xl xl:text-lg font-black italic tracking-tighter uppercase truncate group-hover:overflow-visible transition-all">
                                {stat.value}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-3 rounded-3xl lg:rounded-[2.5rem] border-border shadow-sm bg-card p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase leading-none">Revenue Analytics</h2>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gross Revenue vs Order Volume</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Revenue</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted" /><span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Orders</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 900 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', fontWeight: 900, fontSize: '10px' }} />
                                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col gap-8 mb-12">
                <Card className="rounded-3xl lg:rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase leading-none">Recent Live Orders</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Real-time order tracking</span>
                        </div>
                        <Button onClick={() => router.push("/hub-control/orders")} variant="link" className="text-primary font-black italic tracking-widest text-[10px] uppercase">View Orders</Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground h-14">
                                    <th className="px-6 sm:px-8 py-4">Order ID</th>
                                    <th className="px-6 sm:px-8 py-4 hidden sm:table-cell">Product Name</th>
                                    <th className="px-6 sm:px-8 py-4 text-center">Status</th>
                                    <th className="px-6 sm:px-8 py-4 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {liveOrders.slice(0, 5).map((order) => (
                                    <tr key={order.id} onClick={() => router.push(`/hub-control/orders#${order.id}`)} className="hover:bg-muted/30 transition-all duration-300 group cursor-pointer h-20">
                                        <td className="px-6 sm:px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black uppercase italic tracking-tighter text-foreground group-hover:text-primary transition-colors">{order.id.slice(0, 8)}</span>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-6 text-[10px] font-black uppercase italic tracking-tight text-muted-foreground group-hover:text-primary transition-colors hidden sm:table-cell">
                                            {order.items?.[0]?.name || 'Unknown Product'}
                                        </td>
                                        <td className="px-6 sm:px-8 py-6 text-center">
                                            <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", order.status === 'Processing' ? "bg-primary/10 text-primary border-primary/20" : "bg-success/10 text-success border-success/20")}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8 py-6 text-right text-[11px] font-black italic tracking-tighter text-foreground">KSh {Math.round(order.totalAmount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

        </div>
    )
}
