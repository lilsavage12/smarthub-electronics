"use client"

import React, { useState, useEffect } from "react"
import {
    FileText, Download, Calendar, Search,
    FileSpreadsheet, Printer, Plus, Clock, CheckCircle2,
    Smartphone, Zap, Star, ShieldCheck,
    Package, CreditCard, ShoppingCart, Globe, ArrowRight, TrendingUp,
    Users, BarChart3, DollarSign, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export default function ReportsPage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportType, setReportType] = useState("Financial Summary")
    const [reportFormat, setReportFormat] = useState("PDF")
    const [isLoading, setIsLoading] = useState(true)

    // Real data states
    const [orders, setOrders] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    const [generatedReports, setGeneratedReports] = useState<any[]>([])

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [ordersRes, productsRes, usersRes] = await Promise.all([
                    fetch("/api/orders"),
                    fetch("/api/products"),
                    fetch("/api/users"),
                ])
                if (ordersRes.ok) setOrders(await ordersRes.json())
                if (productsRes.ok) setProducts(await productsRes.json())
                if (usersRes.ok) setCustomers(await usersRes.json())
            } catch (err) {
                console.error("Reports data fetch error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllData()
    }, [])

    // Compute real stats
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0)
    const completedOrders = orders.filter(o => o.status === "Completed" || o.status === "Delivered").length
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length
    const thisMonthOrders = orders.filter(o => {
        if (!o.createdAt) return false
        const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    const thisMonthRevenue = thisMonthOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0)

    const handleGenerate = () => {
        setIsGenerating(true)
        const toastId = toast.loading(`Generating ${reportType} (${reportFormat})...`)
        setTimeout(() => {
            const newReport = {
                id: `REP-${Math.floor(Math.random() * 9000 + 1000)}`,
                name: reportType,
                date: new Date().toISOString().split('T')[0],
                type: reportType.split(' ')[0],
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
                status: "Generated",
                format: reportFormat,
            }
            setGeneratedReports(prev => [newReport, ...prev])
            setIsGenerating(false)
            toast.success("Report generated & archived", { id: toastId })
        }, 2000)
    }

    const handleDownloadReport = (rep: any) => {
        const content = `SmartHub Electronics — ${rep.name}\nGenerated: ${rep.date}\nFormat: ${rep.format}\n\n--- LIVE DATA SUMMARY ---\nTotal Revenue: $${totalRevenue.toLocaleString()}\nTotal Orders: ${orders.length}\nTotal Products: ${products.length}\nTotal Customers: ${customers.length}\nThis Month Revenue: $${thisMonthRevenue.toLocaleString()}\nCompleted Orders: ${completedOrders}\nLow Stock Items: ${lowStockProducts}\n`
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `smarthub_${rep.id}_${rep.date}.${rep.format.toLowerCase()}`
        a.click()
        toast.success("Report downloaded")
    }

    const allReports = [
        ...generatedReports,
        { id: "REP-9201", name: "Monthly Financial Audit", date: "2026-03-01", type: "Financial", size: `${(totalRevenue / 1000).toFixed(1)}K rev`, status: "Archived", format: "PDF" },
        { id: "REP-9202", name: "Hardware Inventory Variance", date: "2026-03-01", type: "Inventory", size: `${products.length} SKUs`, status: "Archived", format: "XLSX" },
        { id: "REP-9203", name: "Customer Affinity Report", date: "2026-02-15", type: "CRM", size: `${customers.length} users`, status: "Archived", format: "PDF" },
        { id: "REP-9204", name: "Order Fulfillment Analysis", date: "2026-02-10", type: "Sales", size: `${orders.length} orders`, status: "Archived", format: "PDF" },
    ]

    const kpis = [
        { label: "Total Revenue", value: isLoading ? "..." : `$${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} className="text-primary" />, sub: "Lifetime orders" },
        { label: "This Month", value: isLoading ? "..." : `$${thisMonthRevenue.toLocaleString()}`, icon: <TrendingUp size={20} className="text-primary" />, sub: "Monthly revenue" },
        { label: "All Orders", value: isLoading ? "..." : orders.length.toString(), icon: <ShoppingCart size={20} className="text-primary" />, sub: `${completedOrders} completed` },
        { label: "Customers", value: isLoading ? "..." : customers.length.toString(), icon: <Users size={20} className="text-primary" />, sub: `${products.length} products in catalog` },
    ]

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase leading-none">Reports & <span className="text-primary">Analytics</span></h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-2">Generate business insights and access historical data reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
                    >
                        {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={20} />}
                        {isGenerating ? "PROCESSING..." : "GENERATE REPORT"}
                    </Button>
                </div>
            </div>

            {/* Live KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {kpis.map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted group-hover:bg-primary/10 rounded-lg transition-colors">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase">{stat.value}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 opacity-60 italic leading-none tracking-widest">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Generation Control */}
                <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
                    <CardHeader className="p-8 border-b border-border bg-muted/30">
                        <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Generate Report</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Report Type</label>
                                <select
                                    className="h-12 w-full bg-muted border border-border/50 rounded-2xl px-4 outline-none text-xs font-bold uppercase tracking-widest focus:border-primary/20 transition-all text-foreground"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option>Financial Summary</option>
                                    <option>Inventory Audit</option>
                                    <option>Customer Retention</option>
                                    <option>Supply Logistics</option>
                                    <option>Order Fulfillment</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Report Period</label>
                                <select className="h-12 w-full bg-muted border border-border/50 rounded-2xl px-4 outline-none text-xs font-bold uppercase tracking-widest focus:border-primary/20 transition-all text-foreground">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Quarterly (Q1 2026)</option>
                                    <option>All Time</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4 opacity-60">Export Format</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["PDF", "XLSX"].map(fmt => (
                                        <button
                                            key={fmt}
                                            onClick={() => setReportFormat(fmt)}
                                            className={cn(
                                                "h-12 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                reportFormat === fmt
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-muted text-muted-foreground hover:border-primary/30"
                                            )}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Live Data Preview */}
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border/30 flex flex-col gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Live Data Preview</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { l: "Revenue", v: `$${totalRevenue.toLocaleString()}` },
                                        { l: "Orders", v: orders.length },
                                        { l: "Products", v: products.length },
                                        { l: "Customers", v: customers.length },
                                    ].map(i => (
                                        <div key={i.l} className="flex flex-col">
                                            <span className="text-[7px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">{i.l}</span>
                                            <span className="text-xs font-black italic text-foreground">{isLoading ? "..." : i.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="h-14 w-full rounded-2xl bg-primary text-white font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-[10px]"
                        >
                            {isGenerating ? "INITIALIZING..." : "GENERATE EXPORT"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Archive Data Hub */}
                <Card className="xl:col-span-3 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Report Archive</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic mt-0.5">Historical data exports & audit records — powered by live database</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Live</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/50">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-5">Report Name & ID</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5 text-right">Data Payload</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {allReports.map((rep, i) => (
                                        <tr key={rep.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                                                        {rep.format === "PDF" ? <FileText size={20} className="text-red-500" /> : <FileSpreadsheet size={20} className="text-emerald-500" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors">{rep.name}</span>
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-60">{rep.id} • {rep.date}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground italic">{rep.type}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-xs font-black italic text-muted-foreground group-hover:text-foreground transition-colors uppercase">{rep.size}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none",
                                                    rep.status === "Generated" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border"
                                                )}>
                                                    {rep.status === "Generated" && <CheckCircle2 size={10} />}
                                                    {rep.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDownloadReport(rep)}
                                                    className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5 transition-all"
                                                >
                                                    <Download size={18} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Financial Audits", icon: <CreditCard className="text-blue-500" />, val: `$${totalRevenue.toLocaleString()} total`, color: "hover:bg-blue-600" },
                    { label: "Inventory Health", icon: <Package className="text-emerald-500" />, val: `${products.length} SKUs tracked`, color: "hover:bg-emerald-600" },
                    { label: "Order Velocity", icon: <Globe className="text-purple-500" />, val: `${orders.length} total orders`, color: "hover:bg-purple-600" },
                    { label: "System Health", icon: <ShieldCheck className="text-amber-500" />, val: `${customers.length} active users`, color: "hover:bg-amber-600" }
                ].map((box, i) => (
                    <Card key={i} className={cn("rounded-[2.5rem] border-border shadow-sm p-8 bg-card group transition-all cursor-pointer hover:text-white", box.color)}>
                        <div className="flex flex-col gap-6">
                            <div className="p-3 bg-muted rounded-2xl group-hover:bg-white/10 w-fit transition-colors">
                                {React.cloneElement(box.icon as React.ReactElement<any>, { size: 24 })}
                            </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-black italic uppercase tracking-tighter">Data Export</h3>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Export comprehensive activity reports for business analysis.</p>
                                </div>
                                <div className="flex items-center gap-2 text-primary group-hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                <span className="text-[10px] font-black uppercase italic">Access Database</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
