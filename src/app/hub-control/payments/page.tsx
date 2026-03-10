"use client"

import React, { useState } from "react"
import {
    CreditCard, DollarSign, TrendingUp, History,
    Search, Filter, Download, MoreHorizontal,
    Plus, Clock, CheckCircle2, XCircle, RefreshCw,
    Smartphone, User, Info, ArrowUpRight, ArrowDownRight, ArrowRight,
    Zap, Globe, ShieldCheck, Wallet, Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const SAMPLE_PAYMENTS = [
    { id: "TX-9201", date: "2026-03-02 10:45", customer: "John Carter", amount: "$1,199.00", method: "Mastercard •••• 4242", status: "Successful", statusColor: "text-emerald-500 bg-emerald-50", fee: "$34.77", gateway: "Stripe" },
    { id: "TX-9202", date: "2026-03-02 09:12", customer: "Alice Morgan", amount: "$1,799.00", method: "Apple Pay", status: "Successful", statusColor: "text-emerald-500 bg-emerald-50", fee: "$52.17", gateway: "Apple Pay" },
    { id: "TX-9203", date: "2026-03-01 18:30", customer: "Apex Corp.", amount: "$10,990.00", method: "Bank Transfer", status: "Pending", statusColor: "text-amber-500 bg-amber-50", fee: "$0.00", gateway: "Direct" },
    { id: "TX-9204", date: "2026-03-01 15:45", customer: "David Wilson", amount: "$899.00", method: "Visa •••• 1122", status: "Failed", statusColor: "text-red-500 bg-red-50", fee: "$0.00", gateway: "Stripe" },
    { id: "TX-9205", date: "2026-03-01 14:20", customer: "Elena R.", amount: "$1,299.00", method: "Google Pay", status: "Successful", statusColor: "text-emerald-500 bg-emerald-50", fee: "$37.67", gateway: "Google Pay" },
]

export default function PaymentsPage() {
    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Capital Flow & Ledger</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Managing global transactions, gateway settlements, and liquidity silos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border font-black italic uppercase tracking-widest text-[10px] gap-2">
                        <Download size={18} />
                        EXPORT LEDGER
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/10 transition-all hover:opacity-90">
                        <Wallet size={20} />
                        INITIATE PAYOUT
                    </Button>
                </div>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Gross Revenue", value: "$124,592", icon: <TrendingUp size={20} className="text-primary" />, sub: "+18.2% vs Last Mo", trend: <ArrowUpRight size={14} className="text-primary" /> },
                    { label: "Net Assets", value: "$42,100", icon: <DollarSign size={20} className="text-primary" />, sub: "Hardware margin 32%", trend: <ArrowUpRight size={14} className="text-primary" /> },
                    { label: "Pending Vault", value: "$15,245", icon: <Lock size={20} className="text-primary" />, sub: "Settlement in 24h", trend: <Clock size={14} className="text-primary" /> },
                    { label: "Reserve Pool", value: "$4,200", icon: <RefreshCw size={20} className="text-muted-foreground" />, sub: "0.5% Dispute Rate", trend: <ArrowDownRight size={14} className="text-muted-foreground" /> }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted group-hover:bg-primary/10 rounded-lg group-hover:text-primary transition-colors">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
                                <div className="flex items-center gap-2">
                                    {stat.trend}
                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 italic">{stat.sub}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card p-6 rounded-3xl border border-border shadow-sm mt-4">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Universal search..."
                        className="w-full h-12 bg-muted rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-primary/20 focus:bg-card transition-all text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    <div className="flex bg-muted p-1 rounded-xl">
                        <Button variant="ghost" className="h-10 px-6 rounded-lg bg-card text-foreground shadow-sm text-[10px] font-black uppercase tracking-widest">Global</Button>
                        <Button variant="ghost" className="h-10 px-6 rounded-lg text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-all">US Vault</Button>
                        <Button variant="ghost" className="h-10 px-6 rounded-lg text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-all">EU Vault</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
                {/* Ledger Data Hub */}
                <Card className="xl:col-span-3 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Financial Ledger Hub</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Real-time transaction authorization & gateway logs</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-muted">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-6">TX ID & Date</th>
                                        <th className="px-8 py-6">Uplink Identity</th>
                                        <th className="px-8 py-6 text-right">Commitment (Gross)</th>
                                        <th className="px-8 py-6">Protocol Status</th>
                                        <th className="px-8 py-6">Gateway</th>
                                        <th className="px-8 py-6 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {SAMPLE_PAYMENTS.map((tx, i) => (
                                        <tr key={i} className="hover:bg-muted/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black italic tracking-widest text-foreground uppercase group-hover:text-primary transition-colors">{tx.id}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">{tx.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black text-foreground uppercase italic tracking-tight">{tx.customer}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-none">{tx.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col gap-1 text-right items-end">
                                                    <span className="text-sm font-black italic text-foreground leading-none">{tx.amount}</span>
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mt-1 opacity-70">Fee: {tx.fee}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none border border-primary/10", tx.status === "Successful" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                                    {tx.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{tx.gateway}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5">
                                                    <MoreHorizontal size={18} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 border-t border-border flex justify-center bg-muted/20">
                            <Button variant="link" className="text-[10px] font-black italic text-primary uppercase tracking-widest gap-2">
                                VIEW ENTIRE HISTORICAL LEDGER
                                <ArrowRight size={14} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Gateway Health & Security */}
                <div className="flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                        <CardHeader className="p-8 border-b border-border bg-muted/30">
                            <CardTitle className="text-lg font-black italic uppercase tracking-tighter text-foreground">Gateway Health</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col gap-6">
                            {[
                                { name: "Stripe", latency: "142ms", availability: "99.99%", status: "OPTIMAL" },
                                { name: "Apple Pay", latency: "86ms", availability: "100%", status: "OPTIMAL" },
                                { name: "Google Pay", latency: "112ms", availability: "99.98%", status: "OPTIMAL" },
                                { name: "PayPal", latency: "245ms", availability: "99.95%", status: "STABLE" },
                            ].map((gw, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black uppercase text-foreground italic tracking-tighter">{gw.name}</span>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 italic leading-none">LATENCY: {gw.latency}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-primary italic">{gw.status}</span>
                                        <span className="text-[8px] font-black text-muted-foreground uppercase italic opacity-40">{gw.availability}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="p-6 bg-primary rounded-[2rem] text-primary-foreground flex flex-col gap-4 shadow-xl shadow-primary/5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-primary-foreground" size={18} fill="currentColor" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic opacity-80">Security Protocol Alpha</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed opacity-90 font-inter tracking-tight">Active fraud detection engine is scanning all incoming signals for anomaly patterns.</p>
                                <Button className="w-full bg-primary-foreground text-primary hover:opacity-90 h-12 rounded-xl font-black italic tracking-widest uppercase text-[10px]">
                                    REVIEW ANOMALY LOGS
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card p-8 transition-colors">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Merchant Terminal IDs</span>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-muted border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">SH-MAIN-US</span>
                                    <span className="px-3 py-1 bg-muted border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">SH-TERMINAL-01</span>
                                    <span className="px-3 py-1 bg-muted border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">SH-VAULT-PRIMARY</span>
                                </div>
                            </div>
                            <div className="h-[2px] w-full bg-border" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Uplink</span>
                                <div className="flex items-center gap-2 text-primary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Encrypted</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
