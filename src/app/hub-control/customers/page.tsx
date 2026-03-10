"use client"

import React, { useState } from "react"
import {
    Users, Search, Filter, Mail, Phone,
    MapPin, ShoppingBag, DollarSign, Star,
    MoreHorizontal, Edit2, Trash2, Eye,
    ChevronRight, ArrowRight, Zap, ShieldCheck,
    MessageSquare, History, UserPlus, Download, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import Link from "next/link"

const SAMPLE_CUSTOMERS = [
    { id: "C-9021", name: "John Carter", email: "j.carter@atlas.com", phone: "+1 415 902 1122", orders: 12, total: "$14,592", status: "VIP", location: "San Francisco, US", avatar: "JC", lastOrder: "2h ago", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "C-9022", name: "Alice Morgan", email: "alice.m@proton.me", phone: "+44 7700 900123", orders: 5, total: "$6,199", status: "Gold", location: "London, UK", avatar: "AM", lastOrder: "1d ago", color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "C-9023", name: "David Wilson", email: "david.w@gmail.com", phone: "+1 212 555 0198", orders: 2, total: "$2,499", status: "Member", location: "New York, US", avatar: "DW", lastOrder: "3d ago", color: "text-muted-foreground", bg: "bg-muted" },
    { id: "C-9024", name: "Elena Reznik", email: "e.reznik@tech.ru", phone: "+7 495 123 4567", orders: 1, total: "$1,199", status: "Member", location: "Moscow, RU", avatar: "ER", lastOrder: "5d ago", color: "text-muted-foreground", bg: "bg-muted" },
    { id: "C-9025", name: "Marcus Chen", email: "marcus.c@nexus.com", phone: "+86 21 6123 4567", orders: 8, total: "$9,200", status: "Gold", location: "Shanghai, CN", avatar: "MC", lastOrder: "12h ago", color: "text-amber-500", bg: "bg-amber-500/10" },
]

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTier, setSelectedTier] = useState("All Tiers")

    const handleExportCRM = () => {
        const toastId = toast.loading("Decrypting customer database for export...")
        setTimeout(() => {
            const headers = "ID,Name,Email,Phone,Tier,Total Spend\n"
            const rows = SAMPLE_CUSTOMERS.map(c => `${c.id},"${c.name}",${c.email},${c.phone},${c.status},${c.total}`).join("\n")
            const blob = new Blob([headers + rows], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `smarthub_crm_${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            toast.success("Golden Record CRM exported successfully", { id: toastId })
        }, 1500)
    }

    const handleAddCustomer = () => {
        toast("Registration terminal coming soon. Use local bypass for now.", { icon: "🆔" })
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Customer CRM & Affinity</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Managing global hardware enthusiasts & loyalty silos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/hub-control/analytics">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-border font-black italic uppercase tracking-widest text-[10px] gap-2 text-primary hover:bg-primary/5 transition-all">
                            <TrendingUp size={18} />
                            CUSTOMER ANALYTICS
                        </Button>
                    </Link>
                    <Button
                        onClick={handleExportCRM}
                        variant="outline"
                        className="h-12 px-6 rounded-2xl border-border font-black italic uppercase tracking-widest text-[10px] gap-2"
                    >
                        <Download size={18} />
                        EXPORT CRM
                    </Button>
                    <Button
                        onClick={handleAddCustomer}
                        className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/10 transition-all hover:opacity-90"
                    >
                        <UserPlus size={20} />
                        ADD CUSTOMER
                    </Button>
                </div>
            </div>

            {/* Loyalty KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Members", value: "842", icon: <Users size={20} className="text-primary" />, sub: "+12.4% MoM" },
                    { label: "Active VIPs", value: "48", icon: <Star size={20} className="text-primary" />, sub: "High affinity users" },
                    { label: "Churn Risk", value: "3%", icon: <Zap size={20} className="text-primary" />, sub: "Health check manual" },
                    { label: "Avg Spend", value: "$4.2K", icon: <DollarSign size={20} className="text-primary" />, sub: "Per user account" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card group hover:shadow-xl transition-all cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/20 transition-colors text-primary">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase">{stat.value}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 opacity-60 italic leading-none tracking-widest">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-card p-6 rounded-[2.5rem] border border-border shadow-sm mt-4">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                    <input
                        type="text"
                        placeholder="Search Identity, Email, Phone..."
                        className="w-full h-12 bg-muted border border-border/50 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/20 transition-all text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-muted-foreground/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full lg:w-auto">
                    {["All Tiers", "VIP", "Gold", "Member"].map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedTier(t)}
                            className={cn(
                                "whitespace-nowrap px-6 h-12 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all border italic",
                                selectedTier === t ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20" : "bg-card border-border text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customer List Data Hub */}
            <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden mb-12 transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-8 py-6">Identity Profile</th>
                                <th className="px-8 py-6">Uplink Details</th>
                                <th className="px-8 py-6">Affinity Status</th>
                                <th className="px-8 py-6">Commitment (Spend)</th>
                                <th className="px-8 py-6">Location Protocol</th>
                                <th className="px-8 py-6 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {SAMPLE_CUSTOMERS.filter(c =>
                                (selectedTier === "All Tiers" || c.status === selectedTier) &&
                                (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).map((customer, i) => (
                                <tr key={customer.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary/10 transition-colors">
                                                {customer.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground italic uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{customer.name}</span>
                                                <span className="text-[10px] font-black italic text-primary uppercase tracking-widest mt-1 opacity-70 italic">{customer.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
                                                <Mail size={12} className="text-muted-foreground opacity-50" />
                                                {customer.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 italic leading-none">
                                                <Phone size={10} className="text-muted-foreground opacity-50" />
                                                {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none border transition-colors",
                                            customer.status === "VIP" ? "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5" :
                                                customer.status === "Gold" ? "bg-muted text-muted-foreground border-border" :
                                                    "bg-muted/50 text-muted-foreground border-border/50"
                                        )}>
                                            {customer.status === "VIP" && <Star size={10} className="fill-primary text-primary" />}
                                            {customer.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black italic text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">{customer.total}</span>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic opacity-60 leading-none">{customer.orders} DISPATCHES</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-tighter italic opacity-80 group-hover:text-foreground transition-colors">
                                            <MapPin size={12} className="text-muted-foreground opacity-40 group-hover:text-primary transition-colors" />
                                            {customer.location}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                onClick={() => toast(`Viewing affinity history for ${customer.name}...`, { icon: "📊" })}
                                                size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5"
                                            >
                                                <History size={18} />
                                            </Button>
                                            <Button
                                                onClick={() => toast("Admin bypass required for advanced ops.", { icon: "🔒" })}
                                                size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
                                            >
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 border-t border-border flex items-center justify-between bg-muted/20">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] italic opacity-60">"Retention Protocol: AI-Personalized Offers Enabled"</span>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="text-[10px] font-black italic uppercase tracking-widest text-muted-foreground h-10 px-4 hover:text-foreground">Previous</Button>
                        <div className="flex items-center gap-1">
                            <Button className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-black text-[10px] shadow-lg shadow-primary/10">1</Button>
                            <Button variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground font-black text-[10px] hover:text-foreground hover:bg-muted">2</Button>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black italic uppercase tracking-widest text-foreground h-10 px-4 hover:bg-muted rounded-xl transition-all">Next Page</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
