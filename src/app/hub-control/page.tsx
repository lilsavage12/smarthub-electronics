"use client"

import React, { useState, useEffect } from "react"
import {
    BarChart3, Users, Smartphone, ShoppingCart,
    Zap, ArrowRight, ArrowUpRight, ArrowDownRight,
    DollarSign, Package, Star, MessageSquare,
    Percent, ShieldCheck, Truck, CreditCard, ChevronRight, FileText, Download, Filter, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

const REVENUE_DATA = [
    { name: 'Mon', revenue: 4500, orders: 12 },
    { name: 'Tue', revenue: 5200, orders: 15 },
    { name: 'Wed', revenue: 3800, orders: 10 },
    { name: 'Thu', revenue: 6500, orders: 22 },
    { name: 'Fri', revenue: 4800, orders: 18 },
    { name: 'Sat', revenue: 8200, orders: 30 },
    { name: 'Sun', revenue: 7000, orders: 25 },
]

const BRAND_SALES_DATA = [
    { name: 'Apple', value: 45 },
    { name: 'Samsung', value: 30 },
    { name: 'Xiaomi', value: 15 },
    { name: 'Oppo', value: 10 },
]
export default function DashboardOverview() {
    const [timeRange, setTimeRange] = useState("7 Days")
    const [liveOrders, setLiveOrders] = useState<any[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const res = await fetch("/api/orders")
                if (res.ok) {
                    const orders = await res.json()
                    setLiveOrders(orders.slice(0, 5))
                }
            } catch (error) {
                console.error("Dashboard Orders Sync Error:", error)
            } finally {
                setLoadingOrders(false)
            }
        }
        fetchRecentOrders()
    }, [])

    const handleExport = () => {
        const toastId = toast.loading("Aggregating dashboard data...")

        try {
            // Prepare Revenue Data
            let csvContent = "DATASET: REVENUE & ORDERS\n"
            csvContent += "Day,Revenue ($),Orders\n"
            REVENUE_DATA.forEach(row => {
                csvContent += `${row.name},${row.revenue},${row.orders}\n`
            })

            // Prepare Brand Data
            csvContent += "\nDATASET: BRAND AFFINITY\n"
            csvContent += "Brand,Market Share (%)\n"
            BRAND_SALES_DATA.forEach(row => {
                csvContent += `${row.name},${row.value}\n`
            })

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `smarthub_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("Dashboard Export Synchronized", { id: toastId })
        } catch (error) {
            console.error("Export Error:", error)
            toast.error("Export Protocol Failed", { id: toastId })
        }
    }

    const handleAction = (type: string) => {
        toast(`Redirecting to ${type} reports...`, { icon: "📈" })
        if (type === "Products") router.push("/hub-control/products")
        if (type === "Logistics") router.push("/hub-control/orders")
    }

    const kpiCards = [
        {
            title: "Total Revenue",
            value: "$124,592",
            trend: "+12.5%",
            isUp: true,
            icon: <DollarSign className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
            href: "/hub-control/payments"
        },
        {
            title: "Orders Today",
            value: "84",
            trend: "+4.2%",
            isUp: true,
            icon: <ShoppingCart className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
            href: "/hub-control/orders"
        },
        {
            title: "Phones Sold",
            value: "1,245",
            trend: "-2.4%",
            isUp: false,
            icon: <Smartphone className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
            href: "/hub-control/inventory"
        },
        {
            title: "Low Stock Alerts",
            value: "12",
            trend: "Critical",
            isUp: false,
            icon: <Package className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
            href: "/hub-control/inventory"
        },
        {
            title: "Returns",
            value: "3",
            trend: "-15%",
            isUp: true,
            icon: <ShieldCheck className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
            href: "/hub-control/warranty"
        },
        {
            title: "Pending Payments",
            value: "$1,199",
            trend: "Expiring",
            isUp: false,
            icon: <CreditCard className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
            href: "/hub-control/payments"
        },
    ]

    return (
        <div className="flex flex-col gap-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">Dashboard Overview</h1>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Welcome back, <span className="text-primary italic">Administrator</span>. Here's your hub's snapshot.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-card border border-border rounded-xl p-1 flex items-center shadow-sm">
                        {["7 Days", "30 Days", "1 Year"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    timeRange === range ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="rounded-xl border-border gap-2 font-black italic tracking-widest uppercase h-11 text-[10px]"
                >
                    <Download size={18} />
                    Export Data
                </Button>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {kpiCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                            toast(`Viewing analytics for ${card.title}`, { icon: "📊" })
                            if (card.href) router.push(card.href)
                        }}
                        className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn("p-3 rounded-xl transition-colors", card.bg)}>
                                    {card.icon}
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                                    card.isUp ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {card.trend}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">{card.title}</h3>
                                <span className="text-2xl font-black italic tracking-tighter text-foreground">{card.value}</span>
                            </div>
                            {/* Mini trend chart simulation */}
                            <div className="mt-4 flex items-end justify-between h-8 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {[40, 70, 45, 90, 65, 80].map((h, j) => (
                                    <div
                                        key={j}
                                        className="flex-1 rounded-sm bg-primary/20"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <Card className="lg:col-span-2 rounded-3xl border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Revenue Analytics</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Gross inflow vs Order Volume</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 mr-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Orders</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-10">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderRadius: '16px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="hsl(var(--muted-foreground))"
                                        strokeWidth={2}
                                        fillOpacity={0}
                                        strokeDasharray="5 5"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales by Brand */}
                <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Brand Affinity</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Market capture by flagship brand</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col gap-8">
                        <div className="h-[230px] w-full flex items-center justify-center relative">
                            {/* Simplified gauge/progress for brands */}
                            <div className="flex flex-col w-full gap-5">
                                {BRAND_SALES_DATA.map((brand, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-foreground">{brand.name}</span>
                                            <span className="text-primary">{brand.value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${brand.value}%` }}
                                                className="h-full rounded-full transition-all duration-1000 bg-primary"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 p-6 bg-muted/50 rounded-2xl flex items-center gap-4 border border-border transition-colors">
                            <div className="bg-primary/10 p-3 rounded-xl">
                                <Zap className="text-primary" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground leading-tight">Growth Insight</span>
                                <p className="text-[11px] text-muted-foreground leading-normal font-medium mt-1">Apple products moving 2.4x faster this week.</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => handleAction("Products")}
                            className="w-full h-14 rounded-2xl font-black italic tracking-widest uppercase mt-2 group"
                            variant="outline"
                        >
                            Full Brand Report
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Orders & Inventory */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                {/* Recent Orders Hub */}
                <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Recent Live Orders</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Real-time express logistics tracking</span>
                        </div>
                        <Button
                            onClick={() => handleAction("Logistics")}
                            variant="link"
                            className="text-primary font-black italic tracking-widest text-xs uppercase"
                        >
                            VIEW LOGISTICS
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-5">Payload ID</th>
                                        <th className="px-8 py-5">Recipient</th>
                                        <th className="px-8 py-5">Hardware Architecture</th>
                                        <th className="px-8 py-5 text-center">Protocol Status</th>
                                        <th className="px-8 py-5 text-right">Value Asset</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loadingOrders ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-muted rounded w-full" /></td>
                                            </tr>
                                        ))
                                    ) : liveOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-10 text-center text-[10px] font-black uppercase text-muted-foreground tracking-widest">No active orders in registry</td>
                                        </tr>
                                    ) : liveOrders.map((order, i) => (
                                        <tr key={order.id} className="hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => router.push("/hub-control/orders")}>
                                            <td className="px-8 py-6 text-xs font-black italic tracking-widest text-foreground">#{order.id.slice(0, 8)}</td>
                                            <td className="px-8 py-6 text-xs font-bold text-muted-foreground max-w-[150px] truncate">{order.customerName || order.shippingAddress?.fullName || 'Anonymous'}</td>
                                            <td className="px-8 py-6 text-xs font-black italic uppercase text-foreground max-w-[200px] truncate">
                                                {order.items?.length > 1 ? `${order.items[0].name} +${order.items.length - 1} more` : order.items?.[0]?.name || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-current",
                                                    order.status === 'Processing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                        order.status === 'Shipped' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black italic text-foreground tracking-tighter">${order.totalAmount?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Warranty & Returns Info */}
                <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Customer Sentiment</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Experience logs & sentiment score</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-black italic text-xl">
                            <Star className="fill-amber-500" size={20} />
                            <span>4.8</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Warranties</h4>
                                    <ShieldCheck className="text-emerald-500" size={20} />
                                </div>
                                <span className="text-2xl font-black italic text-foreground tracking-tighter">842 Units</span>
                                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[92%]" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">92.4% Coverage rate</span>
                            </div>
                            <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Returned Phones</h4>
                                    <Package className="text-red-500" size={20} />
                                </div>
                                <span className="text-2xl font-black italic text-foreground tracking-tighter">14 Units</span>
                                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[4%]" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">1.2% RMA Rate (Healthy)</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">Global Log Entries</h4>
                            {[
                                { user: "Mark S.", msg: "Lumina ZX camera is insane. Best flagship yet.", time: "2h ago" },
                                { user: "Julia K.", msg: "Delivery was within 45 mins. Incredible speed.", time: "5h ago" }
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl items-start hover:border-primary/20 transition-all cursor-pointer bg-muted/30">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-primary text-xs">
                                        {log.user[0]}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black uppercase tracking-tighter text-foreground">{log.user}</span>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">{log.time}</span>
                                        </div>
                                        <p className="text-[11px] font-black text-muted-foreground/80 line-clamp-1 italic leading-tight">"{log.msg}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => toast("Experience logs are being retrieved...", { icon: "📝" })}
                            className="w-full h-14 rounded-2xl font-black italic tracking-widest uppercase mt-2 shadow-sm"
                            variant="premium"
                        >
                            Open Experience Logs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
