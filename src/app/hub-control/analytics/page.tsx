"use client"

import React, { useState } from "react"
import {
    BarChart3, TrendingUp, TrendingDown, Clock,
    Calendar, Search, Filter, Download, MoreHorizontal,
    Plus, Clock as ClockIcon, CheckCircle2, XCircle,
    RefreshCw, Smartphone, User, Info, DollarSign,
    ArrowUpRight, ArrowDownRight, Zap, Globe, ShieldCheck,
    MousePointer2, Eye, ShoppingCart, Target, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie
} from "recharts"

const REVENUE_DATA = [
    { name: "Mon", rev: 12000, orders: 12 },
    { name: "Tue", rev: 14000, orders: 15 },
    { name: "Wed", rev: 11000, orders: 10 },
    { name: "Thu", rev: 18000, orders: 20 },
    { name: "Fri", rev: 22000, orders: 25 },
    { name: "Sat", rev: 25000, orders: 28 },
    { name: "Sun", rev: 21000, orders: 22 },
]

const BRAND_DISTRIBUTION = [
    { name: "Alpha", value: 55, color: "hsl(var(--primary))" },
    { name: "Beta", value: 25, color: "hsl(var(--primary) / 0.7)" },
    { name: "Gamma", value: 12, color: "hsl(var(--primary) / 0.4)" },
    { name: "Delta", value: 8, color: "hsl(var(--primary) / 0.2)" },
]

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Intelligence & Analytics</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Processing hardware demand signals & behavioral silos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => toast("Time-series granularity unlocked. Adjusting silos...", { icon: "📅" })}
                        variant="outline"
                        className="h-12 px-6 rounded-2xl border-border font-black italic uppercase tracking-widest text-[10px] gap-2"
                    >
                        <Calendar size={18} />
                        LAST 7 DAYS
                    </Button>
                    <Button
                        onClick={() => {
                            const tid = toast.loading("Compiling raw behavioral telemetry...")
                            setTimeout(() => toast.success("Data dump ready for secure download", { id: tid }), 2000)
                        }}
                        className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/10 transition-all hover:opacity-90"
                    >
                        <Download size={20} />
                        FULL DATA DUMP
                    </Button>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Visits (Protocol)", value: "12,452", icon: <Eye size={20} className="text-primary" />, sub: "5.2% unique daily" },
                    { label: "Conversion Delta", value: "3.24%", icon: <Target size={20} className="text-primary" />, sub: "+0.2% vs last week" },
                    { label: "Engagement", value: "84%", icon: <Activity size={20} className="text-primary" />, sub: "Session depth high" },
                    { label: "Revenue Momentum", value: "+18%", icon: <TrendingUp size={20} className="text-primary" />, sub: "Alpha trajectory" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted group-hover:bg-primary/10 rounded-lg group-hover:text-primary transition-colors">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase">{stat.value}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 opacity-60 italic leading-none">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Revenue Trajectory Chart */}
                <Card className="xl:col-span-2 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Revenue Trajectory</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-none">Protocol sales vs Fulfillment logs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                                <Button variant="ghost" className="h-8 px-4 rounded-lg bg-card text-foreground shadow-sm text-[9px] font-black uppercase tracking-widest">Daily</Button>
                                <Button variant="ghost" className="h-8 px-4 rounded-lg text-muted-foreground text-[9px] font-black uppercase tracking-widest hover:text-foreground transition-all">Weekly</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "16px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rev"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Brand Distribution Chart */}
                <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="p-8 border-b border-border">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Silo Share</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-none">Market capture by hardware brand</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={BRAND_DISTRIBUTION}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {BRAND_DISTRIBUTION.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-4 w-full mt-6">
                            {BRAND_DISTRIBUTION.map((brand, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color }} />
                                        <span className="text-[10px] font-black uppercase text-foreground tracking-tighter italic">{brand.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black italic text-muted-foreground opacity-60 leading-none">{brand.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[
                    { label: "Avg. Basket Size", value: "$1,242", icon: <ShoppingCart size={18} />, sub: "+4.2% HIGHER THAN PREVIOUS CYCLE", color: "text-primary" },
                    { label: "Session Depth", value: "4m 24s", icon: <MousePointer2 size={18} />, sub: "HIGHER ENGAGEMENT RECORDED", color: "text-primary" },
                    { label: "Cart Protocol Leak", value: "12.4%", icon: <Zap size={18} />, sub: "DROP-OFF AT PAYMENT STAGE", color: "text-destructive" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card p-8 group transition-all hover:bg-primary hover:text-primary-foreground relative">
                        <div className="flex flex-col gap-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary-foreground/10 transition-colors">
                                    <div className={cn("group-hover:text-primary-foreground transition-all", stat.color)}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black italic tracking-tighter leading-none">{stat.value}</span>
                                <span className="text-[9px] font-black opacity-60 uppercase mt-2 tracking-widest leading-none italic">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
