"use client"

import React, { useState } from "react"
import {
    MessageSquare, Mail, Bell, Zap,
    CheckCircle2, AlertCircle, Clock,
    Search, Filter, Plus, Edit2,
    MoreHorizontal, Send, Settings,
    BarChart3, Eye, MousePointer2, Target,
    ShieldCheck, RefreshCw, Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const NOTIFICATION_TEMPLATES = [
    { id: "NT-001", name: "Order Confirmation", trigger: "Order Created", status: "Active", sent: 1240, opened: 980, clicked: 120, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "NT-002", name: "Shipping Uplink Active", trigger: "Tracking Added", status: "Active", sent: 840, opened: 720, clicked: 410, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "NT-003", name: "Account Verification", trigger: "User Signup", status: "Active", sent: 2100, opened: 1850, clicked: 1800, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "NT-004", name: "Cart Abandonment Protocol", trigger: "Inactivity (1h)", status: "Active", sent: 432, opened: 210, clicked: 45, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "NT-005", name: "Restock Notification", trigger: "Inventory > 0", status: "Paused", sent: 0, opened: 0, clicked: 0, color: "text-muted-foreground", bg: "bg-muted" },
]

export default function CommunicationsPage() {
    const [isSimulatingLink, setIsSimulatingLink] = useState(false)

    const handleSimulation = () => {
        setIsSimulatingLink(true)
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Initializing Mail Protocol...',
                success: 'Automated Campaign Synced Successfully',
                error: 'Communication Error: Signal Lost',
            },
            {
                style: {
                    background: '#0F172A',
                    color: '#fff',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '800'
                }
            }
        ).finally(() => setIsSimulatingLink(false))
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase leading-none">Communication Hub</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-2">Automated email silos & notification dispatch protocols.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-card hover:bg-muted font-black italic uppercase tracking-widest text-[10px] gap-2 transition-all">
                        <Settings size={16} />
                        HUB SETTINGS
                    </Button>
                    <Button
                        onClick={handleSimulation}
                        disabled={isSimulatingLink}
                        className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:opacity-90"
                    >
                        {isSimulatingLink ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                        SYNC PROTOCOLS
                    </Button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
                {[
                    { label: "Total Sent", value: "4.2K", icon: <Send size={20} className="text-primary" />, sub: "Last 30 cycles" },
                    { label: "Open Rate", value: "82%", icon: <Eye size={20} className="text-primary" />, sub: "+4% vs Alpha" },
                    { label: "CTR Protocol", value: "12.4%", icon: <MousePointer2 size={20} className="text-primary" />, sub: "Engagement High" },
                    { label: "Unsubscribe", value: "0.2%", icon: <AlertCircle size={20} className="text-destructive" />, sub: "Retention Optimal" }
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12 overflow-hidden">
                {/* Active Automation Templates */}
                <Card className="xl:col-span-2 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors flex flex-col h-full">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Automation Templates</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-none">Live communication silos & triggers</span>
                        </div>
                        <Button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/10 transition-all hover:opacity-90">
                            <Plus size={16} />
                            NEW TEMPLATE
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto no-scrollbar flex-1">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full text-left font-inter table-fixed">
                                <thead className="bg-muted">
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        <th className="px-8 py-5 w-[40%]">Template Payload</th>
                                        <th className="px-8 py-5 w-[25%]">Trigger Protocol</th>
                                        <th className="px-8 py-5 w-[20%]">Performance</th>
                                        <th className="px-8 py-5 w-[15%] text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {NOTIFICATION_TEMPLATES.map((tpl) => (
                                        <tr key={tpl.id} className="hover:bg-muted/50 transition-all duration-500 group cursor-pointer border-b border-border last:border-0 h-24">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", tpl.bg, tpl.color)}>
                                                        <Mail size={16} />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[11px] font-black italic text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-none truncate">{tpl.name}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-0 group-hover:opacity-40 transition-all duration-500 translate-y-1 group-hover:translate-y-0">{tpl.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl w-fit border border-border/50 group-hover:border-primary/20 transition-all">
                                                    <Zap size={10} className="text-primary opacity-40 group-hover:opacity-100 transition-all" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground italic opacity-60 group-hover:opacity-100 transition-all">{tpl.trigger}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-foreground leading-none tracking-tighter uppercase">{tpl.sent}</span>
                                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-40 transition-all duration-500">SENT</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-primary leading-none tracking-tighter uppercase">{tpl.opened}</span>
                                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-40 transition-all duration-500">OPEN</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-xl transition-all">
                                                        <MoreHorizontal size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>

                {/* Dispatch Health & Channel Stats */}
                <div className="flex flex-col gap-8 overflow-hidden">
                    <Card className="rounded-[2.5rem] border-border shadow-sm bg-card p-8 group hover:bg-primary hover:text-primary-foreground transition-all relative overflow-hidden shadow-2xl">
                        <div className="flex flex-col gap-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">System Throughput</span>
                                <div className="p-2 bg-muted group-hover:bg-primary-foreground/10 rounded-xl transition-colors">
                                    <BarChart3 size={18} className="text-primary group-hover:text-primary-foreground" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black italic tracking-tighter leading-none uppercase">99.8%</span>
                                <span className="text-[9px] font-black opacity-60 uppercase mt-2 tracking-widest leading-none italic">DELIVERY PROTOCOL SUCCESS</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted group-hover:bg-primary-foreground/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "99.8%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-primary group-hover:bg-primary-foreground"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border shadow-sm bg-card p-8 transition-colors overflow-hidden h-full">
                        <div className="flex flex-col gap-8">
                            <CardTitle className="text-xl font-black italic uppercase tracking-tight">Channel Capacity</CardTitle>
                            <div className="flex flex-col gap-6">
                                {[
                                    { label: "Email (Primary)", val: 85, icon: <Mail size={16} /> },
                                    { label: "SMS Protocol", val: 12, icon: <Smartphone size={16} /> },
                                    { label: "Push Notification", val: 3, icon: <Bell size={16} /> }
                                ].map((channel, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground opacity-60">{channel.icon}</span>
                                                <span className="text-[10px] font-black uppercase text-foreground tracking-widest italic">{channel.label}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground opacity-60 italic">{channel.val}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${channel.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-muted border border-border rounded-2xl transition-colors hover:border-primary/20 group mt-auto">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={16} className="text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] italic opacity-80">TLS 1.3 Encryption Active</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
