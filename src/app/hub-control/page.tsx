"use client"

import React, { useState, useEffect } from "react"
import {
    ShoppingCart, Download, Package, Smartphone, AlertTriangle,
    RefreshCw, CreditCard, Tag, ShieldCheck, ChevronRight,
    TrendingUp, Star, MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardOverview() {
    const [liveOrders, setLiveOrders] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [discounts, setDiscounts] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchData = async () => {
        try {
            const [ordersRes, productsRes, discountsRes, reviewsRes] = await Promise.all([
                fetch("/api/orders"),
                fetch("/api/products"),
                fetch("/api/discounts"),
                fetch("/api/reviews")
            ])

            if (ordersRes.ok) setLiveOrders(await ordersRes.json())
            if (productsRes.ok) setProducts(await productsRes.json())
            if (discountsRes.ok) setDiscounts(await discountsRes.json())
            if (reviewsRes.ok) setReviews(await reviewsRes.json())
        } catch (error) {
            console.error("Dashboard Sync Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 10000) // 10s polling
        return () => clearInterval(interval)
    }, [])

    const handleExport = () => {
        const toastId = toast.loading("Aggregating dashboard data...")
        setTimeout(() => toast.success("Dashboard Export Synchronized", { id: toastId }), 1000)
    }

    // KPI Calculations
    const today = new Date().toISOString().split('T')[0]
    const ordersToday = liveOrders.filter(o => o.createdAt.startsWith(today)).length
    const totalRevenue = liveOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0)
    const phonesSold = liveOrders.reduce((acc, o) => {
        const phoneItems = o.items?.filter((i: any) => i.name.toLowerCase().includes('iphone') || i.name.toLowerCase().includes('galaxy') || i.name.toLowerCase().includes('phone')) || []
        return acc + phoneItems.reduce((sum: number, i: any) => sum + i.quantity, 0)
    }, 0)
    const lowStockAlerts = products.filter(p => p.stock < 10).length
    const returnsCount = liveOrders.filter(o => o.status === 'RETURNED').length
    const pendingPayments = liveOrders.filter(o => o.paymentStatus === 'UNPAID').reduce((acc, o) => acc + o.totalAmount, 0)

    const activeCoupons = discounts.filter(d => d.status === 'Active').length
    const totalSaved = discounts.reduce((acc, d) => acc + (d.usedCount * (parseFloat(d.value) || 0)), 0) // Simplified
    const totalRedemptions = discounts.reduce((acc, d) => acc + d.usedCount, 0)

    // Brand Affinity
    const brandSales: Record<string, number> = {}
    liveOrders.forEach(o => {
        o.items?.forEach((item: any) => {
            // Find product brand
            const product = products.find(p => p.id === item.productId)
            const brand = product?.brand || "Other"
            brandSales[brand] = (brandSales[brand] || 0) + item.quantity
        })
    })
    const totalUnits = Object.values(brandSales).reduce((acc, v) => acc + v, 0)
    const affinityData = Object.entries(brandSales)
        .map(([name, units]) => ({ name, percentage: totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0 }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 4)

    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        const revenue = liveOrders.filter(o => o.createdAt.startsWith(dateStr)).reduce((acc, o) => acc + o.totalAmount, 0)
        return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue }
    })

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase leading-none">Dashboard Overview</h1>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-none mt-2">Welcome back, <span className="text-primary italic">Administrator</span>. Here's your hub's snapshot.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
                        {['7 Days', '30 Days', '1 Year'].map(p => (
                            <button key={p} className={cn("px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", p === '7 Days' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>{p}</button>
                        ))}
                    </div>
                    <Button onClick={handleExport} variant="outline" className="rounded-xl border-border gap-2 font-black italic tracking-widest uppercase h-11 text-[10px]"><Download size={18} /> Export Data</Button>
                </div>
            </div>

            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={16} />, sub: "+12.5%", color: "text-primary" },
                    { label: "Orders Today", value: ordersToday.toString(), icon: <ShoppingCart size={16} />, sub: "+4.2%", color: "text-primary" },
                    { label: "Phones Sold", value: phonesSold.toLocaleString(), icon: <Smartphone size={16} />, sub: "-2.4%", color: "text-muted-foreground" },
                    { label: "Low Stock Alerts", value: lowStockAlerts.toString(), icon: <AlertTriangle size={16} />, sub: "CRITICAL", color: "text-red-500" },
                    { label: "Returns", value: returnsCount.toString(), icon: <RefreshCw size={16} />, sub: "-15%", color: "text-primary" },
                    { label: "Pending Payments", value: `$${pendingPayments.toLocaleString()}`, icon: <CreditCard size={16} />, sub: "EXPIRING", color: "text-muted-foreground" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-muted rounded-lg text-primary">{stat.icon}</div>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", stat.color)}>{stat.sub}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                            <span className="text-2xl font-black italic tracking-tighter uppercase">{stat.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2 rounded-[2.5rem] border-border shadow-sm bg-card p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Revenue Analytics</h2>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gross Inflow vs Order Volume</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Revenue</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted" /><span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Orders</span></div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
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

                <Card className="rounded-[2.5rem] border-border shadow-sm bg-card p-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Brand Affinity</h2>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Capture by Flagship Brand</span>
                    </div>
                    <div className="flex flex-col gap-8 mt-4">
                        {affinityData.length > 0 ? affinityData.map((brand, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>{brand.name}</span>
                                    <span className="text-primary">{brand.percentage}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${brand.percentage}%` }} />
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
                                <Package size={48} />
                                <span className="text-[10px] font-black uppercase tracking-widest mt-4">No Affinity Data</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-auto p-6 bg-muted rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-primary/5 transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><TrendingUp size={20} /></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase italic tracking-tight">Growth Insight</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Apple products moving 2.4x faster this week.</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase leading-none">Recent Live Orders</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Real-time express logistics tracking</span>
                        </div>
                        <Button onClick={() => router.push("/hub-control/orders")} variant="link" className="text-primary font-black italic tracking-widest text-[10px] uppercase">View Logistics</Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    <th className="px-8 py-5">Recipient</th>
                                    <th className="px-8 py-5">Hardware Architecture</th>
                                    <th className="px-8 py-5">Protocol Status</th>
                                    <th className="px-8 py-5 text-right">Value Asset</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {liveOrders.slice(0, 4).map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase italic text-foreground leading-none">{order.customerName || 'Anonymous'}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{order.city || 'Remote Hub'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black uppercase italic tracking-tight text-muted-foreground group-hover:text-primary transition-colors">
                                            {order.items?.[0]?.name || 'Unknown Unit'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", order.status === 'Processing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-[11px] font-black italic tracking-tighter text-foreground">${order.totalAmount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border-border shadow-sm bg-card p-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-black italic tracking-tight uppercase leading-none">Customer Sentiment</h2>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Experience Logs & Sentiment Score</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500">
                            <Star size={18} className="fill-current" />
                            <span className="text-lg font-black italic">4.8</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-muted rounded-3xl flex flex-col gap-4 border border-border">
                            <div className="flex items-center justify-between text-primary"><span className="text-[9px] font-black uppercase tracking-widest">Active Warranties</span><ShieldCheck size={14} /></div>
                            <div className="flex flex-col"><span className="text-2xl font-black italic uppercase italic tracking-tighter leading-none">842 Units</span><span className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">92.4% Coverage Rate</span></div>
                        </div>
                        <div className="p-5 bg-muted rounded-3xl flex flex-col gap-4 border border-border">
                            <div className="flex items-center justify-between text-red-500"><span className="text-[9px] font-black uppercase tracking-widest">Returned Phones</span><Package size={14} /></div>
                            <div className="flex flex-col"><span className="text-2xl font-black italic uppercase italic tracking-tighter leading-none">{returnsCount} Units</span><span className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">1.2% RMA Rate (Healthy)</span></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Global Log Entries</span>
                        {reviews.length > 0 ? reviews.slice(0, 2).map((review, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-2xl border border-border hover:border-primary/20 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-xs text-primary">{review.user[0]}</div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">{review.user}</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Real-time</span></div>
                                    <p className="text-[10px] font-bold italic text-muted-foreground leading-tight line-clamp-1">"{review.comment}"</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-6 opacity-30"><MessageSquare size={32} /><span className="text-[9px] font-black uppercase tracking-widest mt-2">No Experience Logs</span></div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Final Coupon Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Active Coupons", value: `${activeCoupons} Codes`, icon: <Tag size={20} />, sub: "Targeting 8.4% CR" },
                    { label: "Total Saved", value: `$${totalSaved.toLocaleString()}`, icon: <CreditCard size={20} />, sub: "Value Distributed" },
                    { label: "Redemptions", value: totalRedemptions.toLocaleString(), icon: <RefreshCw size={20} />, sub: "+14% Weekly Shift" },
                    { label: "Security", value: "Alpha", icon: <ShieldCheck size={20} />, sub: "Always Active" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-8 bg-card flex flex-col gap-6 group hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">{stat.label}</span>
                            <div className="p-2 bg-muted rounded-xl text-primary group-hover:bg-primary/20 transition-colors">{stat.icon}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl font-black italic tracking-tighter uppercase italic leading-none">{stat.value}</span>
                            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-widest italic">{stat.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
