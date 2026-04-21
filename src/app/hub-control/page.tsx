"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
    ShoppingCart, Smartphone, AlertTriangle,
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

    // KPI Calculations synchronized with user's core status logic
    const totalRevenue = useMemo(() => {
        // "sync the total revenue with completed orders" - including Paid as well for accuracy
        const successful = filteredOrders.filter(o => {
            const s = (o.status || '').toUpperCase()
            const p = (o.paymentStatus || '').toUpperCase()
            return (s === 'COMPLETED' || s === 'DELIVERED' || p === 'PAID') && s !== 'CANCELLED'
        })
        return successful.reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
    }, [filteredOrders])
    
    const phonesSold = useMemo(() => {
        const active = filteredOrders.filter(o => (o.status || '').toUpperCase() !== 'CANCELLED')
        return active.reduce((acc, o) => acc + (o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0), 0)
    }, [filteredOrders])

    const lowStockAlerts = useMemo(() => (products || []).filter(p => (p.stock || 0) < 10).length, [products])

    const pendingOrdersCount = useMemo(() => {
        // "pending orders" - count of orders not yet completed or cancelled
        const pending = liveOrders.filter(o => {
            const s = (o.status || '').toUpperCase()
            return s !== 'COMPLETED' && s !== 'CANCELLED' && s !== 'DELIVERED'
        })
        return pending.length
    }, [liveOrders])

    const chartData = useMemo(() => {
        if (!liveOrders.length) return []

        // Handle ALL TIME (null) vs Specific Ranges
        if (timeRange === null) {
            // Find oldest order to determine if we need yearly or monthly grouping
            const dates = liveOrders.map(o => new Date(o.createdAt).getTime()).filter(d => !isNaN(d))
            const oldestDate = dates.length ? new Date(Math.min(...dates)) : new Date()
            const now = new Date()
            const yearDiff = now.getFullYear() - oldestDate.getFullYear()

            if (yearDiff >= 2) {
                // Multi-year view: Group by Year
                const years: any[] = []
                for (let y = oldestDate.getFullYear(); y <= now.getFullYear(); y++) {
                    const ordersInYear = liveOrders.filter(o => new Date(o.createdAt).getFullYear() === y)
                    const revenue = ordersInYear
                        .filter(o => {
                            const s = (o.status || '').toUpperCase()
                            const p = (o.paymentStatus || '').toUpperCase()
                            return (s === 'COMPLETED' || s === 'DELIVERED' || p === 'PAID') && s !== 'CANCELLED'
                        })
                        .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
                    
                    years.push({ name: y.toString(), value: revenue })
                }
                return years
            } else {
                // Short-term ALL TIME: Show last 12 months for better detail
                const months: any[] = []
                for (let i = 11; i >= 0; i--) {
                    const d = new Date()
                    d.setMonth(d.getMonth() - i)
                    const label = d.toLocaleDateString('en-US', { month: 'short' })
                    const monthKey = d.toISOString().slice(0, 7)
                    
                    const ordersInMonth = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(monthKey))
                    const revenue = ordersInMonth
                        .filter(o => {
                            const s = (o.status || '').toUpperCase()
                            const p = (o.paymentStatus || '').toUpperCase()
                            return (s === 'COMPLETED' || s === 'DELIVERED' || p === 'PAID') && s !== 'CANCELLED'
                        })
                        .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)
                    
                    months.push({ name: label, value: revenue })
                }
                return months
            }
        }

        // Specific Time Ranges (7D, 30D, 1Y)
        const points = timeRange === '1 YEAR' ? 12 : (timeRange === '30 DAYS' ? 30 : 7)
        return Array.from({ length: points }).map((_, i) => {
            const d = new Date()
            let label = ""
            let ordersInRange: any[] = []

            if (timeRange === '7 DAYS') {
                d.setDate(d.getDate() - (points - 1 - i))
                label = d.toLocaleDateString('en-US', { weekday: 'short' })
                const dateStr = d.toISOString().split('T')[0]
                ordersInRange = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr))
            } else if (timeRange === '30 DAYS') {
                d.setDate(d.getDate() - (points - 1 - i))
                label = d.getDate().toString()
                const dateStr = d.toISOString().split('T')[0]
                ordersInRange = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr))
            } else {
                d.setMonth(d.getMonth() - (points - 1 - i))
                label = d.toLocaleDateString('en-US', { month: 'short' })
                const monthStr = d.toISOString().slice(0, 7)
                ordersInRange = liveOrders.filter(o => o.createdAt && o.createdAt.startsWith(monthStr))
            }

            const revenue = ordersInRange
                .filter(o => {
                    const s = (o.status || '').toUpperCase()
                    const p = (o.paymentStatus || '').toUpperCase()
                    return (s === 'COMPLETED' || s === 'DELIVERED' || p === 'PAID') && s !== 'CANCELLED'
                })
                .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0)

            return { name: label, value: revenue }
        })
    }, [liveOrders, timeRange])

    if (loading && !liveOrders.length) return (
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
            <RefreshCcw className="w-10 h-10 text-slate-900 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]  opacity-50">Synchronizing Hub Data...</span>
        </div>
    )

    return (
        <div className="flex flex-col gap-6 sm:gap-8 py-4 sm:py-6 w-full animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-4 sm:px-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000]  uppercase tracking-tighter text-slate-900 leading-none">Dashboard Overview</h1>
                    <p className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] mt-0.5">
                        WELCOME BACK, <span className="text-slate-900">ADMINISTRATOR</span>. HERE'S YOUR DASHBOARD SNAPSHOT.
                    </p>
                </div>
                <div className="bg-[#F8FAFC] p-1 rounded-xl flex items-center border border-slate-200 shrink-0">
                    {['7 DAYS', '30 DAYS', '1 YEAR'].map((p) => (
                        <button 
                            key={p} 
                            onClick={() => setTimeRange(timeRange === p ? null : p)}
                            className={cn(
                                "px-4 py-2 sm:px-5 sm:py-2 text-[9px] sm:text-[10px] font-[900] uppercase tracking-widest rounded-lg transition-all duration-300",
                                timeRange === p ? "bg-[#0F172A] text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 px-4 sm:px-6">
                {[
                    { label: "TOTAL REVENUE", value: `KSH ${Math.round(totalRevenue).toLocaleString()}`, icon: <TrendingUp size={16} />, sub: "", color: "" },
                    { label: "DEVICES SOLD", value: phonesSold.toString(), icon: <Smartphone size={16} />, sub: "", color: "" },
                    { label: "LOW STOCK ALERTS", value: lowStockAlerts.toString(), icon: <AlertTriangle size={16} />, sub: "CRITICAL", color: "text-red-500" },
                    { label: "PENDING ORDERS", value: pendingOrdersCount.toString(), icon: <ShoppingCart size={16} />, sub: "ACTIVE", color: "text-slate-400" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-slate-200 shadow-sm p-4 sm:p-5 bg-white flex flex-col gap-4 sm:gap-6 group hover:shadow-lg transition-all duration-500 relative overflow-hidden min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-slate-900 border border-slate-100 shrink-0">
                                {stat.icon}
                            </div>
                            {stat.sub && (
                                <span className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] mt-0.5", stat.color)}>{stat.sub}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 sm:gap-1.5 min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                            <span className="text-[1rem] sm:text-[1.2rem] lg:text-[1.3rem] xl:text-[1.6rem] font-[1000]  tracking-tighter text-slate-900 uppercase leading-none whitespace-nowrap overflow-visible">
                                {stat.value}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Revenue Analytics chart */}
            <div className="px-4 sm:px-6">
                <Card className="rounded-[2rem] border-slate-200 shadow-sm p-6 sm:p-8 bg-white overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl sm:text-3xl font-[1000]  tracking-tighter uppercase leading-none text-slate-900">REVENUE ANALYTICS</h2>
                            <p className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest leading-none">GROSS REVENUE VS ORDER VOLUME</p>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-900" />
                                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">REVENUE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">ORDERS</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[320px] sm:h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 9, fontWeight: 800 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 9, fontWeight: 800 }}
                                    dx={-5}
                                    tickFormatter={(v) => v === 0 ? "0" : Math.round(v).toLocaleString()}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                                    itemStyle={{ color: '#0F172A', fontWeight: 900, textTransform: 'uppercase', fontSize: '9px' }}
                                    formatter={(v) => Math.round(Number(v)).toLocaleString()}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#0F172A" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorVal)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Live Orders table */}
            <div className="px-4 sm:px-6 pb-12">
                <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-white">
                    <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl sm:text-2xl font-[1000]  tracking-tighter uppercase leading-none text-slate-900">RECENT LIVE ORDERS</h2>
                            <p className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest leading-none">REAL-TIME ORDER TRACKING</p>
                        </div>
                        <button 
                            onClick={() => router.push("/hub-control/orders")}
                            className="text-[10px] sm:text-[11px] font-black uppercase  tracking-[0.2em] text-slate-900 hover:opacity-70 transition-opacity"
                        >
                            VIEW ORDERS
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-[#F8FAFC]">
                                <tr className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 h-14 border-b border-slate-50">
                                    <th className="px-6 sm:px-8">ORDER ID</th>
                                    <th className="px-6 sm:px-8">PRODUCT NAME</th>
                                    <th className="px-6 sm:px-8">STATUS</th>
                                    <th className="px-6 sm:px-8 text-right">VALUE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(liveOrders.length ? liveOrders.slice(0, 5) : [
                                    { id: '1CB0434A', customerEmail: 'HAZAMAKI12@GMAIL.COM', status: 'Processing', totalAmount: 479, items: [{ name: 'APPLE IPHONE 13 (STARLIGHT / 8GB+128GB)' }] },
                                    { id: 'BB394EC4', customerEmail: 'HAZAMAKI12@GMAIL.COM', status: 'Processing', totalAmount: 3355, items: [{ name: 'APPLE IPHONE 13 (RED / 8GB+128GB)' }] },
                                    { id: '09599D92', customerEmail: 'HAZAMAKI12@GMAIL.COM', status: 'Delivered', totalAmount: 479, items: [{ name: 'APPLE IPHONE 13 (STARLIGHT / 8GB+128GB)' }] },
                                    { id: '698E5BE9', customerEmail: 'HAZAMAKI12@GMAIL.COM', status: 'Completed', totalAmount: 2556, items: [{ name: 'APPLE IPHONE 13 (GREEN / 8GB+128GB)' }] },
                                    { id: '95321368', customerEmail: 'HAZAMAKI12@GMAIL.COM', status: 'Completed', totalAmount: 1757, items: [{ name: 'APPLE IPHONE 13 (STARLIGHT / 8GB+128GB)' }] },
                                ]).map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-all h-16 sm:h-20 group cursor-pointer" onClick={() => router.push(`/hub-control/orders`)}>
                                        <td className="px-6 sm:px-8">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] sm:text-[13px] font-[1000] text-slate-900  uppercase tracking-tighter">{order.id.slice(0, 8).toUpperCase()}</span>
                                                <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8">
                                            <span className="text-[9px] sm:text-[11px] font-[900] text-slate-500  uppercase tracking-tighter group-hover:text-slate-900 transition-colors">
                                                {order.items?.[0]?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8">
                                            <span className={cn(
                                                "text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 py-1 sm:px-5 sm:py-1 rounded-full border shadow-sm inline-flex items-center justify-center min-w-[90px] sm:min-w-[110px]",
                                                order.status?.toLowerCase() === 'processing' ? "bg-slate-100 text-slate-900 border-slate-200" : 
                                                order.status?.toLowerCase() === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-emerald-100 text-emerald-600 border-emerald-100"
                                            )}>
                                                {order.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8 text-right">
                                            <span className="text-[12px] sm:text-[14px] font-[1000]  tracking-tighter text-slate-900">
                                                KSh {Math.round(order.totalAmount).toLocaleString()}
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
