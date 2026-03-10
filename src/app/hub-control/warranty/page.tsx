"use client"

import React, { useState } from "react"
import {
    ShieldCheck, AlertTriangle, Package, History,
    ArrowRight, Search, Filter, Printer, MoreHorizontal,
    Plus, Clock, CheckCircle2, XCircle, RefreshCw,
    Smartphone, User, Info, DollarSign, Calendar, Zap, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const WARRANTY_LOGS = [
    { id: "RMA-0421", date: "2026-03-02", model: "iPhone 16 Pro Max", variant: "Titanium / 256GB", customer: "John Carter", status: "In Inspection", statusColor: "text-blue-500 bg-blue-50", type: "Defective Hardware", warranty: "Active (18M left)" },
    { id: "RMA-0422", date: "2026-03-01", model: "Samsung S24 Ultra", variant: "Silver / 512GB", customer: "Alice Morgan", status: "Replacement Authorized", statusColor: "text-emerald-500 bg-emerald-50", type: "Display Defect", warranty: "Active (22M left)" },
    { id: "RMA-0423", date: "2026-03-01", model: "Lumina ZX", variant: "Aurora", customer: "Marcus Chen", status: "Refund Pending", statusColor: "text-amber-500 bg-amber-50", type: "Battery Failure", warranty: "Active (12M left)" },
    { id: "RMA-0424", date: "2026-02-28", model: "iPhone 15 Pro", variant: "Blue", customer: "David Wilson", status: "RMA Denied", statusColor: "text-red-500 bg-red-50", type: "Water Damage", warranty: "Voided" },
]

export default function WarrantyPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All RMA")

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Returns & Warranty Protocol</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Managing hardware RMA, warranty voids, and replacement logistics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                        <Plus size={20} />
                        START NEW RMA
                    </Button>
                </div>
            </div>

            {/* Quality KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Warranties", value: "842 Units", icon: <ShieldCheck size={20} className="text-emerald-500" />, sub: "98.4% Health Score" },
                    { label: "Pending RMA", value: "6 Cases", icon: <AlertTriangle size={20} className="text-amber-500" />, sub: "48h response target" },
                    { label: "Replacement Rate", value: "1.2%", icon: <RefreshCw size={20} className="text-blue-500" />, sub: "Hardware stability high" },
                    { label: "Warranty Payouts", value: "$1,245", icon: <DollarSign size={20} className="text-red-500" />, sub: "Current month cost" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted group-hover:bg-primary/10 rounded-lg group-hover:text-primary transition-colors">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 opacity-60 italic">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card p-6 rounded-3xl border border-border shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search RMA ID, Customer, or Smartphone..."
                        className="w-full h-12 bg-muted rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-primary/20 focus:bg-card transition-all text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1 lg:pb-0">
                    {["All RMA", "Inspecting", "Authorized", "Refunded", "Denied"].map(ts => (
                        <button
                            key={ts}
                            onClick={() => setStatusFilter(ts)}
                            className={cn(
                                "whitespace-nowrap px-6 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border",
                                statusFilter === ts ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20" : "bg-card border-border text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {ts}
                        </button>
                    ))}
                    <Button variant="outline" className="h-12 rounded-xl border-border px-4 ml-2">
                        <Filter size={18} className="text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* RMA Database Table */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors h-full">
                    <CardHeader className="p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">RMA Logistics Hub</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Active return merchandise authorization flow</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-muted">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        <th className="px-8 py-5">Case ID & Date</th>
                                        <th className="px-8 py-5">Hardware Logic</th>
                                        <th className="px-8 py-5">Issue Identity</th>
                                        <th className="px-8 py-5">Status Protocol</th>
                                        <th className="px-8 py-5 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {WARRANTY_LOGS.map((rma, i) => (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black italic tracking-widest text-foreground uppercase group-hover:text-primary transition-colors">{rma.id}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase leading-none opacity-60">{rma.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black italic text-foreground uppercase tracking-tight leading-none">{rma.model}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-2 opacity-60">{rma.variant}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black uppercase text-foreground opacity-80">{rma.type}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">{rma.warranty}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none bg-muted text-muted-foreground border border-border/50")}>
                                                    {rma.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5 transition-all">
                                                        <History size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 border-t border-border flex justify-center bg-muted/20">
                            <Button variant="link" className="text-[10px] font-black italic text-primary uppercase tracking-widest gap-2">
                                VIEW HISTORICAL RMA DATABASE
                                <ArrowRight size={14} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Warranty Verification Assistant */}
                <div className="flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors h-full">
                        <CardHeader className="p-8 border-b border-border bg-primary text-primary-foreground">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Warranty Verification</CardTitle>
                                <span className="text-[10px] font-black tracking-widest uppercase opacity-60">SH-VERIFY-V1 PROTOCOL</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col gap-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">IMEI / Serial Hub</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <input
                                            type="text"
                                            placeholder="3584XXXXXXXX672"
                                            className="h-14 w-full bg-muted border border-border/50 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/20 transition-all text-xs font-bold uppercase tracking-[0.2em] text-foreground placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>
                                <Button className="h-14 w-full rounded-2xl bg-primary text-primary-foreground font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                                    RUN AUTHENTICATION
                                </Button>
                            </div>

                            <div className="p-8 bg-muted border border-border rounded-[2rem] flex flex-col items-center gap-6 text-center">
                                <div className="p-4 bg-card rounded-2xl shadow-sm">
                                    <Clock size={40} className="text-primary stroke-[1.5px] animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-black italic uppercase tracking-tight text-foreground leading-none">Awaiting Identity Input</h4>
                                    <p className="text-[9px] font-black text-muted-foreground leading-relaxed uppercase opacity-60 tracking-widest italic">Enter hardware digital signature to retrieve warranty status and history.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors h-full">
                        <CardHeader className="p-8 border-b border-border">
                            <CardTitle className="text-lg font-black italic uppercase tracking-tight">Defect Log Density</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col gap-8">
                            <div className="flex flex-col gap-6">
                                {[
                                    { part: "Display / Panel", rate: 55, color: "bg-blue-500" },
                                    { part: "Battery Logic", rate: 25, color: "bg-emerald-500" },
                                    { part: "Network Modem", rate: 12, color: "bg-amber-500" },
                                    { part: "Optics Control", rate: 8, color: "bg-red-500" },
                                ].map((part, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-80">{part.part}</span>
                                            <span className="text-[10px] font-black italic text-primary">{part.rate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${part.rate}%` }}
                                                className={cn("h-full rounded-full transition-all duration-1000", part.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3">
                                <Zap className="text-primary mt-1" size={18} fill="currentColor" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-foreground leading-none">Critical Insight</span>
                                    <p className="text-[9px] font-black leading-relaxed text-muted-foreground uppercase italic opacity-60 mt-1">"Panel defects are concentrated in Batch SH-AP16-256T. Recommend pre-shipment stress check."</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
