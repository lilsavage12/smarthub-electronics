"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
    ShoppingCart, ShoppingBag, AlertTriangle,
    CreditCard, RefreshCcw, TrendingUp
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"

export default function DashboardOverview() {
    const [liveOrders, setLiveOrders] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [discounts, setDiscounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<string | null>(null)
    const router = useRouter()

    const fetchData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers: any = {}
            if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

            const [ordersRes, productsRes, discountsRes] = await Promise.all([
                fetch("/api/orders", { headers }),
                fetch("/api/products", { headers }),
                fetch("/api/discounts", { headers })
            ])

            if (ordersRes.ok) setLiveOrders(await ordersRes.json())
            if (productsRes.ok) setProducts(await productsRes.json())
            if (discountsRes.ok) setDiscounts(await discountsRes.json())
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

    const filteredOrders = useMemo(() => {
        const now = new Date()
        let cutoff = new Date(0)
        if (timeRange === "7 DAYS") {
            cutoff = new Date()
            cutoff.setDate(now.getDate() - 7)
        } else if (timeRange === "30 DAYS") {
            cutoff = new Date()
            cutoff.setDate(now.getDate() - 30)
        } else if (timeRange === "1 YEAR") {
            cutoff = new Date()
            cutoff.setFullYear(now.getFullYear() - 1)
        } else if (timeRange === null) {
            return liveOrders
        }
        
        return liveOrders.filter(o => new Date(o.createdAt) >= cutoff)
    }, [liveOrders, timeRange])

    const totalRevenue = useMemo(() => {
        const successful = filteredOrders.filter(o => {
            const s = (o.status || '').toUpperCase()
            const p = (o.paymentStatus || '').toUpperCase()
            return (s === 'COMPLETED' || s === 'DELIVERED' || p === 'PAID') && s !== 'CANCELLED'
        })
        return successful.reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
    }, [filteredOrders])
    
    const piecesSold = useMemo(() => {
        const active = filteredOrders.filter(o => (o.status || '').toUpperCase() !== 'CANCELLED')
        return active.reduce((acc, o) => acc + (o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0), 0)
    }, [filteredOrders])

    const lowStockAlerts = useMemo(() => (products || []).filter(p => (p.stock || 0) < 10).length, [products])

    const pendingOrdersCount = useMemo(() => {
        const pending = liveOrders.filter(o => {
            const s = (o.status || '').toUpperCase()
            return s !== 'COMPLETED' && s !== 'CANCELLED' && s !== 'DELIVERED'
        })
        return pending.length
    }, [liveOrders])

    const chartData = useMemo(() => {
        if (!liveOrders.length) {
            return [
                { name: 'Mon', value: 8000 },
                { name: 'Tue', value: 12500 },
                { name: 'Wed', value: 9000 },
                { name: 'Thu', value: 16500 },
                { name: 'Fri', value: 24000 },
                { name: 'Sat', value: 32000 },
                { name: 'Sun', value: 28500 }
            ]
        }

        const points = timeRange === '1 YEAR' ? 12 : (timeRange === '30 DAYS' ? 30 : 7)
        return Array.from({ length: points }).map((_, i) => {
            const d = new Date()
            let label = ""
            let ordersInRange: any[] = []

            if (timeRange === '7 DAYS' || timeRange === null) {
                d.setDate(d.getDate() - (points - 1 - i))
                label = d.toLocaleDateString('en-US', { weekday: 'short' })
                const dateStr = d.toISOString().split('T')[0]
                ordersInRange = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr))
            } else if (timeRange === '30 DAYS') {
                d.setDate(d.getDate() - (points - 1 - i))
                label = `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`
                const dateStr = d.toISOString().split('T')[0]
                ordersInRange = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr))
            } else {
                d.setMonth(d.getMonth() - (points - 1 - i))
                label = d.toLocaleDateString('en-US', { month: 'short' })
                const monthStr = d.toISOString().slice(0, 7)
                ordersInRange = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(monthStr))
            }

            const val = ordersInRange
                .filter(o => (o.status || '').toUpperCase() !== 'CANCELLED')
                .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)

            return { name: label, value: val }
        })
    }, [liveOrders, timeRange])

    return (
        <div className="flex flex-col gap-6 sm:gap-8 py-4 sm:py-6 w-full animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-4 sm:px-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tighter text-foreground leading-none font-f1">
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] mt-0.5 font-f1">
                        WELCOME BACK, <span className="text-foreground">PADDOCK ADMINISTRATOR</span>. REAL-TIME TELEMETRY SNAPSHOT.
                    </p>
                </div>
                <div className="bg-muted/40 dark:bg-white/5 text-foreground p-1 rounded-xl flex items-center border border-border shrink-0">
                    {['7 DAYS', '30 DAYS', '1 YEAR'].map((p) => (
                        <button 
                            key={p} 
                            onClick={() => setTimeRange(timeRange === p ? null : p)}
                            className={cn(
                                "px-4 py-2 sm:px-5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 font-f1 cursor-pointer",
                                timeRange === p ? "bg-[#e10600] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards (Theme-Aware, Dark Card Background) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 px-4 sm:px-6">
                {[
                    { label: "TOTAL REVENUE", value: `KSH ${Math.round(totalRevenue).toLocaleString()}`, icon: <TrendingUp size={16} />, sub: "", color: "" },
                    { label: "PIECES SOLD", value: piecesSold.toString(), icon: <ShoppingBag size={16} />, sub: "", color: "" },
                    { label: "LOW STOCK ALERTS", value: lowStockAlerts.toString(), icon: <AlertTriangle size={16} />, sub: "CRITICAL", color: "text-[#e10600]" },
                    { label: "PENDING ORDERS", value: pendingOrdersCount.toString(), icon: <ShoppingCart size={16} />, sub: "ACTIVE", color: "text-muted-foreground" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border border-border dark:border-white/10 shadow-sm p-4 sm:p-5 bg-card dark:bg-[#111114] text-card-foreground flex flex-col gap-4 sm:gap-6 group hover:shadow-lg transition-all duration-300 relative overflow-hidden min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted/40 dark:bg-white/5 text-foreground flex items-center justify-center border border-border/50 shrink-0">
                                {stat.icon}
                            </div>
                            {stat.sub && (
                                <span className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] mt-0.5 font-f1", stat.color)}>{stat.sub}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 sm:gap-1.5 min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-f1">{stat.label}</span>
                            <span className="text-[1.2rem] sm:text-[1.4rem] lg:text-[1.5rem] xl:text-[1.8rem] font-black tracking-tighter text-foreground uppercase leading-none whitespace-nowrap overflow-visible font-f1">
                                {stat.value}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Revenue Analytics chart */}
            <div className="px-4 sm:px-6">
                <Card className="rounded-[2rem] border border-border dark:border-white/10 shadow-sm p-6 sm:p-8 bg-card dark:bg-[#111114] text-card-foreground overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none text-foreground font-f1">REVENUE ANALYTICS</h2>
                            <p className="text-muted-foreground font-bold uppercase text-[9px] sm:text-[10px] tracking-widest leading-none font-f1">GROSS REVENUE VS ORDER VOLUME</p>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#e10600]" />
                                <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest font-f1">REVENUE (KSH)</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[320px] sm:h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e10600" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#e10600" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 800 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 800 }}
                                    dx={-5}
                                    tickFormatter={(v) => v === 0 ? "0" : Math.round(v).toLocaleString()}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        background: '#18181b', 
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', 
                                        padding: '12px' 
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, textTransform: 'uppercase', fontSize: '11px' }}
                                    formatter={(v) => `Ksh ${Math.round(Number(v)).toLocaleString()}`}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#e10600" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorVal)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Live Orders table */}
            <div className="px-4 sm:px-6 pb-12">
                <Card className="rounded-[2rem] border border-border dark:border-white/10 shadow-sm overflow-hidden bg-card dark:bg-[#111114] text-card-foreground">
                    <div className="p-6 sm:p-8 border-b border-border/40 flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none text-foreground font-f1">RECENT LIVE ORDERS</h2>
                            <p className="text-muted-foreground font-bold uppercase text-[9px] sm:text-[10px] tracking-widest leading-none font-f1">REAL-TIME TELEMETRY TRACKING</p>
                        </div>
                        <button 
                            onClick={() => router.push("/hub-control/orders")}
                            className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#e10600] hover:underline transition-all font-f1 cursor-pointer"
                        >
                            VIEW ALL ORDERS →
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-muted/40 dark:bg-white/5 text-foreground">
                                <tr className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground h-14 border-b border-border/40 font-f1">
                                    <th className="px-6 sm:px-8">ORDER ID</th>
                                    <th className="px-6 sm:px-8">CUSTOMER / EMAIL</th>
                                    <th className="px-6 sm:px-8">PIECE</th>
                                    <th className="px-6 sm:px-8">STATUS</th>
                                    <th className="px-6 sm:px-8 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 dark:divide-white/5">
                                {(liveOrders.length ? liveOrders.slice(0, 5) : [
                                    { id: 'F1-294012', customerName: 'Brian Kimani', customerEmail: 'brian@driver.ke', status: 'Processing', totalAmount: 4000, items: [{ name: 'CAVALLINO TRACK JACKET' }] },
                                    { id: 'F1-294011', customerName: 'Sharon Muthoni', customerEmail: 'sharon@paddock.ke', status: 'Delivered', totalAmount: 2500, items: [{ name: 'SCUDERIA ROSSO POLO' }] },
                                    { id: 'F1-294010', customerName: 'David Omondi', customerEmail: 'david@f1.ke', status: 'Completed', totalAmount: 6500, items: [{ name: 'SANTANDER TRI-PANEL JACKET' }] },
                                    { id: 'F1-294009', customerName: 'Michael Kiprono', customerEmail: 'kiprono@kenya.ke', status: 'Processing', totalAmount: 2500, items: [{ name: 'CADILLAC TEAM POLO' }] },
                                ]).map((order, idx) => (
                                    <tr key={idx} className="hover:bg-muted/20 dark:hover:bg-white/5 transition-all h-16 sm:h-20 group cursor-pointer" onClick={() => router.push(`/hub-control/orders`)}>
                                        <td className="px-6 sm:px-8">
                                            <span className="text-[11px] sm:text-[13px] font-black text-foreground uppercase tracking-tight font-f1">
                                                {order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-foreground font-f1">{order.customerName || "Customer"}</span>
                                                <span className="text-[9px] text-muted-foreground">{order.customerEmail || order.customerPhone || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8">
                                            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-tight group-hover:text-foreground transition-colors font-f1">
                                                {order.items?.[0]?.name || "F1 Apparel Piece"}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm inline-flex items-center justify-center font-f1",
                                                order.status?.toLowerCase() === 'processing' 
                                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                                    : order.status?.toLowerCase() === 'delivered' 
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {order.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8 text-right">
                                            <span className="text-[12px] sm:text-[14px] font-black tracking-tight text-foreground font-f1">
                                                Ksh {Math.round(order.totalAmount).toLocaleString()}
                                            </span>
                                        </td>
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
