"use client"

import React, { useState, useEffect } from "react"
import {
    ShieldCheck, Search, Filter, Download,
    Calendar, User, Smartphone, ShoppingBag,
    AlertCircle, CheckCircle2, Info, Lock,
    Smartphone as DeviceIcon, RefreshCcw,
    ChevronDown, ChevronUp, History, Database,
    UserCircle, ShieldAlert
} from "lucide-react"
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { toast } from "react-hot-toast"

interface AuditLog {
    id: string
    action: string
    category: 'Product' | 'Order' | 'User' | 'System' | 'Security'
    details: string
    adminId: string
    adminName: string
    adminEmail: string
    timestamp: any
    severity: 'Low' | 'Medium' | 'High' | 'Critical'
    metadata?: any
}

const MOCK_LOGS: AuditLog[] = [
    {
        id: 'L-8422',
        action: 'ADMIN_LOGIN',
        category: 'Security',
        details: 'Admin login successful from IP 192.168.1.1',
        adminName: 'System Admin',
        adminEmail: 'admin@smarthub.com',
        adminId: 'ROOT',
        timestamp: { toDate: () => new Date() },
        severity: 'Low'
    },
    {
        id: 'L-8423',
        action: 'PRODUCT_UPDATED',
        category: 'Product',
        details: 'Modified SKU: SH-101-BLK base pricing model',
        adminName: 'Inventory Mgr',
        adminEmail: 'inventory@smarthub.com',
        adminId: 'A-42',
        timestamp: { toDate: () => new Date(Date.now() - 3600000) },
        severity: 'Medium'
    },
    {
        id: 'L-8424',
        action: 'ORDER_REFUND_ISS',
        category: 'Order',
        details: 'Refunded $1,299 for Order #SH-9022 (Defective Unit)',
        adminName: 'Support Lead',
        adminEmail: 'support@smarthub.com',
        adminId: 'S-12',
        timestamp: { toDate: () => new Date(Date.now() - 7200000) },
        severity: 'High'
    },
    {
        id: 'L-8425',
        action: 'DATABASE_SYNC',
        category: 'System',
        details: 'Global inventory synchronization completed across regions',
        adminName: 'System Bot',
        adminEmail: 'bot@smarthub.com',
        adminId: 'SYS-BOT',
        timestamp: { toDate: () => new Date(Date.now() - 10800000) },
        severity: 'Low'
    },
    {
        id: 'L-8426',
        action: 'SEC_UNAUTH_ATTEMPT',
        category: 'Security',
        details: 'Detected 3 failed login attempts from unknown IP 45.12.8.9',
        adminName: 'Security Monitor',
        adminEmail: 'security@smarthub.com',
        adminId: 'SEC-MONITOR',
        timestamp: { toDate: () => new Date(Date.now() - 14400000) },
        severity: 'Critical'
    },
    {
        id: 'L-8427',
        action: 'CRM_EXPORT_CSV',
        category: 'User',
        details: 'Customer database exported for marketing operations',
        adminName: 'Marketing Dir',
        adminEmail: 'marketing@smarthub.com',
        adminId: 'M-05',
        timestamp: { toDate: () => new Date(Date.now() - 18000000) },
        severity: 'Medium'
    }
]

const SEVERITY_COLORS: Record<string, string> = {
    'Low': 'bg-blue-500/10 text-blue-500 border-blue-200/20',
    'Medium': 'bg-amber-500/10 text-amber-500 border-amber-200/20',
    'High': 'bg-orange-500/10 text-orange-500 border-orange-200/20',
    'Critical': 'bg-red-500/10 text-red-500 border-red-200/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
}

const CATEGORY_ICONS: Record<string, any> = {
    'Product': <Smartphone size={14} />,
    'Order': <ShoppingBag size={14} />,
    'User': <UserCircle size={14} />,
    'System': <Database size={14} />,
    'Security': <Lock size={14} />,
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/audit")
                if (res.ok) {
                    const data = await res.json()
                    setLogs(data)
                }
            } catch (error) {
                console.error("Audit fetch error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
        const interval = setInterval(fetchLogs, 10000)
        return () => clearInterval(interval)
    }, [])

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "All" || log.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const handleExport = () => {
        const headers = "ID,Timestamp,Action,Category,Admin,Details,Severity\n"
        const rows = filteredLogs.map(l => {
            const time = l.timestamp?.toDate ? l.timestamp.toDate().toISOString() : 'N/A'
            return `${l.id},${time},${l.action},${l.category},${l.adminName},"${l.details}",${l.severity}`
        }).join("\n")
        const blob = new Blob([headers + rows], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success("Activity Logs Downloaded")
    }

    return (
        <div className="flex flex-col gap-10 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Activity Logs</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Complete history of all administrative actions and security events.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        className="h-12 px-6 rounded-xl border border-border font-black italic tracking-widest uppercase text-[10px] gap-2 hover:bg-muted"
                        onClick={handleExport}
                    >
                        <Download size={18} />
                        EXPORT LOGS
                    </Button>
                    <div className="h-12 px-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
                        <ShieldCheck className="text-primary" size={18} />
                        <span className="text-[10px] font-black uppercase text-primary italic leading-none">Security Status: Active</span>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Logs", value: "12,482", icon: <History className="text-blue-500" />, bg: "bg-blue-500/5", sub: "Last 24 Hours: +142" },
                    { label: "Security Events", value: "12", icon: <Lock className="text-red-500" />, bg: "bg-red-500/5", sub: "Unusual Authorization: 0" },
                    { label: "Database Syncs", value: "842", icon: <Database className="text-amber-500" />, bg: "bg-amber-500/5", sub: "Latency Avg: 12ms" },
                    { label: "Active Admins", value: "3", icon: <UserCircle className="text-emerald-500" />, bg: "bg-emerald-500/5", sub: "Across 2 Regions" },
                ].map((s, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className={cn("p-3 w-fit rounded-xl transition-colors", s.bg)}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black italic tracking-tighter">{s.value}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                            <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-1 italic">{s.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Log Table */}
            <div className="flex flex-col gap-6 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50 pb-8">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search activity logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 bg-muted border-none rounded-xl pl-12 pr-4 text-sm font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                        {["All", "Product", "Order", "Security", "System"].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    categoryFilter === cat
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <th className="px-6 py-5">Event ID & Time</th>
                                <th className="px-6 py-5">Action</th>
                                <th className="px-6 py-5">Administrator</th>
                                <th className="px-6 py-5 text-center">Category</th>
                                <th className="px-6 py-5 text-center">Severity</th>
                                <th className="px-6 py-5">Activity Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-muted rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-foreground tracking-tight uppercase">{log.id}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'N/A'} • {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary leading-none uppercase">{log.action}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mt-1">SYSTEM EVENT</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-primary">
                                                <UserCircle size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-foreground">{log.adminName}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{log.adminId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-lg border-border bg-muted/40 text-muted-foreground text-[8px] font-black uppercase tracking-widest gap-2">
                                            {CATEGORY_ICONS[log.category]}
                                            {log.category}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <Badge className={cn("px-4 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest", SEVERITY_COLORS[log.severity])}>
                                            {log.severity}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-xs font-medium text-muted-foreground line-clamp-1 italic max-w-xs">{log.details}</p>
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
