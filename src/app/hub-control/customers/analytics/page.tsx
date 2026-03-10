"use client"

import React from "react"
import {
    Users, TrendingUp, TrendingDown, Target,
    Activity, DollarSign, UserCheck, UserMinus,
    Calendar, Download, ArrowUpRight, ArrowDownRight,
    Search, Filter, MousePointer2, PieChart as PieIcon,
    BarChart3, LineChart as LineIcon, Globe, Smartphone,
    Heart, ShoppingBag, Zap, Mail, MessageSquare, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from "recharts"
import { cn } from "@/lib/utils"

const ACQUISITION_DATA = [
    { name: "Mon", direct: 400, social: 240, search: 200 },
    { name: "Tue", direct: 300, social: 139, search: 280 },
    { name: "Wed", direct: 200, social: 980, search: 290 },
    { name: "Thu", direct: 278, social: 390, search: 200 },
    { name: "Fri", direct: 189, social: 480, search: 181 },
    { name: "Sat", direct: 239, social: 380, search: 250 },
    { name: "Sun", direct: 349, social: 430, search: 210 },
]

const CHURN_DATA = [
    { name: "Jan", rate: 4.2 },
    { name: "Feb", rate: 3.8 },
    { name: "Mar", rate: 4.5 },
    { name: "Apr", rate: 3.2 },
    { name: "May", rate: 2.9 },
    { name: "Jun", rate: 2.1 },
]

const SEGMENT_DATA = [
    { name: "Enthusiasts", value: 45, color: "#2563EB" },
    { name: "Corporate", value: 30, color: "#10B981" },
    { name: "Privacy Focused", value: 15, color: "#F59E0B" },
    { name: "Budget Savvy", value: 10, color: "#EF4444" },
]

export default function CustomerAnalyticsPage() {
    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customer Intelligence</h1>
                    <p className="text-sm font-medium text-slate-500 tracking-tight">Deciphering behavioral silos & lifetime value delta.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl bg-white border-slate-200 font-bold gap-2">
                        <Calendar size={18} />
                        LAST 30 CYCLES
                    </Button>
                    <Button className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold gap-2 shadow-lg shadow-slate-200">
                        <Download size={20} />
                        EXTRACT INTELLIGENCE
                    </Button>
                </div>
            </div>

            {/* Top Intelligence Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Predictive LTV", value: "$4.8K", icon: <DollarSign size={20} />, sub: "+12.4% vs previous", trend: "up", color: "text-emerald-500" },
                    { label: "Active Cohort", value: "2,412", icon: <UserCheck size={20} />, sub: "Retention alpha stable", trend: "up", color: "text-blue-500" },
                    { label: "Churn Velocity", value: "2.1%", icon: <UserMinus size={20} />, sub: "-0.8% health check", trend: "down", color: "text-rose-500" },
                    { label: "Conversion Lift", value: "4.2%", icon: <Target size={20} />, sub: "Campaign uplink success", trend: "up", color: "text-amber-500" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-3xl border-none shadow-sm p-6 bg-white group hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                            <div className={cn("p-2 bg-slate-50 group-hover:bg-slate-100 rounded-xl transition-colors", stat.color)}>{stat.icon}</div>
                        </div>
                        <div className="flex flex-col mt-4">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-black italic tracking-tighter text-slate-900 leading-none">{stat.value}</span>
                                {stat.trend === "up" ? <ArrowUpRight className="text-emerald-500" size={24} /> : <ArrowDownRight className="text-rose-500" size={24} />}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-widest">{stat.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Behavioral Flow (Acquisition) Chart */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-extrabold tracking-tight">Acquisition Vectors</CardTitle>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Inbound traffic silos by source</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 rounded-xl"><Download size={20} /></Button>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ACQUISITION_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
                                <Bar dataKey="direct" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} barSize={20} />
                                <Bar dataKey="social" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={20} />
                                <Bar dataKey="search" stackId="a" fill="#F59E0B" radius={[10, 10, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Churn Resistance Chart */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-extrabold tracking-tight">Churn Resistance</CardTitle>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Retention delta tracking protocol</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest italic">Improving</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHURN_DATA}>
                                <defs>
                                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorChurn)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Cohort Segments */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex flex-col text-center">
                            <CardTitle className="text-xl font-extrabold tracking-tight">Segment Profile</CardTitle>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">Active mission silos by type</span>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={SEGMENT_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {SEGMENT_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {SEGMENT_DATA.map((s, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900 leading-none">{s.name}</span>
                                    </div>
                                    <span className="text-sm font-black italic text-slate-500 ml-3.5 tracking-tighter">{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Behavioral Insights */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 -z-1">
                        <ShieldCheck size={200} className="text-primary" />
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-extrabold tracking-tight">Behavioral Log</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Processing real-time engagement metadata</p>
                            </div>
                            <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">View Master Logs</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Session Depth", value: "4m 42s", sub: "Alpha engagement detected", icon: <Activity className="text-primary" /> },
                                { title: "NPS Score", value: "9.2/10", sub: "Affinity momentum high", icon: <Heart className="text-rose-500" /> },
                                { title: "Returning Ratio", value: "64.2%", icon: <Zap className="text-amber-500" />, sub: "Loyalty protocol active" },
                                { title: "Mobile Uplink", value: "82.1%", icon: <Smartphone className="text-blue-500" />, sub: "Hardware primary source" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-primary/10 hover:shadow-xl transition-all">
                                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        {React.cloneElement(item.icon, { size: 24 })}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black italic text-slate-900 tracking-tighter leading-none">{item.value}</span>
                                        </div>
                                        <div className="flex flex-col mt-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.title}</span>
                                            <span className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">{item.sub}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none italic">"AI Insight: Customer retention is trending upward after recent loyalty protocol deployment."</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
