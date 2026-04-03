"use client"

import React, { useState, useEffect } from "react"
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
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/users")
            if (res.ok) {
                const data = await res.json()
                setCustomers(data.length > 0 ? data : SAMPLE_CUSTOMERS)
            }
        } catch (error) {
            console.error("CRM Fetch Error:", error)
            setCustomers(SAMPLE_CUSTOMERS)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const handleExportCRM = () => {
        const toastId = toast.loading("Preparing customer database for export...")
        setTimeout(() => {
            const headers = "ID,Name,Email,Join Date,Role\n"
            const rows = customers.map(c => `${c.id},"${c.displayName || 'Anonymous'}",${c.email},${new Date(c.createdAt).toLocaleDateString()},${c.role}`).join("\n")
            const blob = new Blob([headers + rows], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `smarthub_customers_${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            toast.success("Customer database exported successfully", { id: toastId })
        }, 1500)
    }

    const handleAddCustomer = () => {
        toast("Invite system active. Use 'Security' section to issue admin invites.", { icon: "🆔" })
    }

    const activeVIPs = customers.filter(c => c.role === "ADMIN" || c.status === "VIP").length

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Customer Directory</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Manage your global customer base and membership tiers.</p>
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
                </div>
            </div>

            {/* Loyalty KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Customers", value: customers.length.toString(), icon: <Users size={20} className="text-primary" />, sub: "Active accounts" },
                    { label: "VIP Members", value: activeVIPs.toString(), icon: <Star size={20} className="text-primary" />, sub: "High-value segment" },
                    { label: "Sync Status", value: "Live", icon: <Zap size={20} className="text-primary" />, sub: "Real-time updates" },
                    { label: "Avg LTV Score", value: "94.2", icon: <DollarSign size={20} className="text-primary" />, sub: "Loyalty Index" }
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

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-card p-6 rounded-[2.5rem] border border-border shadow-sm mt-4">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full h-12 bg-muted border border-border/50 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/20 transition-all text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-muted-foreground/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Customer Database */}
            <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden mb-12 transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-8 py-6">Customer Profile</th>
                                <th className="px-8 py-6">Contact Details</th>
                                <th className="px-8 py-6">Membership Tier</th>
                                <th className="px-8 py-6">Registration</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {customers.filter(c =>
                                (c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).map((customer, i) => (
                                <tr key={customer.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary/10 transition-colors">
                                                {customer.displayName?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground italic uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{customer.displayName || 'Anonymous User'}</span>
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
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none border transition-colors",
                                            customer.role === "ADMIN" ? "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5" : "bg-muted text-muted-foreground border-border"
                                        )}>
                                            {customer.role === "ADMIN" && <Star size={10} className="fill-primary text-primary" />}
                                            {customer.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black italic text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic opacity-60 leading-none">JOINED</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                onClick={() => toast(`Viewing order history for ${customer.displayName || 'user'}...`, { icon: "📊" })}
                                                size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5"
                                            >
                                                <History size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
