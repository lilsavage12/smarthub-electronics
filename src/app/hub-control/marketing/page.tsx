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
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"

const NOTIFICATION_TEMPLATES = [
    { id: "NT-001", name: "Order Confirmation", trigger: "Order Created", status: "Active", sent: 1240, opened: 980, clicked: 120, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "NT-002", name: "Shipping Updates Active", trigger: "Tracking Added", status: "Active", sent: 840, opened: 720, clicked: 410, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "NT-003", name: "Account Verification", trigger: "User Signup", status: "Active", sent: 2100, opened: 1850, clicked: 1800, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "NT-004", name: "Cart Abandonment Automation", trigger: "Inactivity (1h)", status: "Active", sent: 432, opened: 210, clicked: 45, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "NT-005", name: "Restock Notification", trigger: "Inventory > 0", status: "Paused", sent: 0, opened: 0, clicked: 0, color: "text-muted-foreground", bg: "bg-muted" },
]

const PERFORMANCE_DATA = [
    { name: '00:00', throughput: 85, latency: 120 },
    { name: '04:00', throughput: 70, latency: 110 },
    { name: '08:00', throughput: 92, latency: 140 },
    { name: '12:00', throughput: 99, latency: 130 },
    { name: '16:00', throughput: 88, latency: 125 },
    { name: '20:00', throughput: 95, latency: 115 },
    { name: '23:59', throughput: 99.8, latency: 105 },
]

export default function CommunicationsPage() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isSimulatingLink, setIsSimulatingLink] = useState(false)
    const [syncProgress, setSyncProgress] = useState(0)
    const [settings, setSettings] = useState({
        encryption: true,
        redundancy: true,
        autoSync: false
    })

    const handleSync = async () => {
        setIsSimulatingLink(true)
        setSyncProgress(0)

        const stages = [
            { name: "Initializing Email Channels...", duration: 800 },
            { name: "Verifying SMS Templates...", duration: 1000 },
            { name: "WhatsApp API Connection...", duration: 1200 },
            { name: "Cloud Distribution Sync...", duration: 800 }
        ]

        const loadingToast = toast.loading("SYNCING MARKETING CHANNELS...", {
            style: { background: '#0F172A', color: '#fff', borderRadius: '16px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em' }
        })

        try {
            for (let i = 0; i < stages.length; i++) {
                setSyncProgress(((i + 1) / stages.length) * 100)
                toast.loading(stages[i].name, { id: loadingToast })
                await new Promise(r => setTimeout(r, stages[i].duration))
            }
            toast.success("CHANNEL SYNC COMPLETE: ALL SYSTEMS ONLINE", { id: loadingToast })
        } catch (error) {
            toast.error("SYNC FAILED: CONNECTION INTERRUPTED", { id: loadingToast })
        } finally {
            setIsSimulatingLink(false)
            setTimeout(() => setSyncProgress(0), 500)
        }
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-border flex items-center justify-between bg-primary/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                        <Settings size={20} className="animate-spin-slow" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">Marketing Settings</h2>
                                </div>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="rounded-xl"
                                    onClick={() => setIsSettingsOpen(false)}
                                >
                                    <MoreHorizontal className="rotate-90" />
                                </Button>
                            </div>

                            <div className="p-8 flex flex-col gap-6">
                                {[
                                    { id: 'encryption', title: 'Data Encryption', sub: 'Secure TLS 1.3 Communication', icon: <ShieldCheck size={18} /> },
                                    { id: 'redundancy', title: 'Failover Support', sub: 'Automatic system backup', icon: <RefreshCw size={18} /> },
                                    { id: 'autoSync', title: 'Auto-Update Sync', sub: 'Automated 24h background sync', icon: <Clock size={18} /> },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-background rounded-xl text-primary/60 group-hover:text-primary transition-colors">
                                                {item.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black uppercase tracking-widest italic">{item.title}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{item.sub}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof settings] }))}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-all relative",
                                                settings[item.id as keyof typeof settings] ? "bg-primary" : "bg-muted"
                                            )}
                                        >
                                            <motion.div 
                                                animate={{ x: settings[item.id as keyof typeof settings] ? 24 : 4 }}
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-muted/50 border-t border-border flex justify-end">
                                <Button 
                                    onClick={() => {
                                        toast.success("Marketing settings updated", {
                                            style: { background: '#0F172A', color: '#fff', borderRadius: '16px', fontSize: '10px', fontWeight: '900' }
                                        })
                                        setIsSettingsOpen(false)
                                    }}
                                    className="h-12 px-10 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px]"
                                >
                                    SAVE SETTINGS
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase leading-none">Marketing <span className="text-primary">Hub</span></h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-2">Automated customer communication & multi-channel distribution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsSettingsOpen(true)}
                        variant="outline" 
                        className="h-12 px-6 rounded-2xl border-border bg-card hover:bg-muted font-black italic uppercase tracking-widest text-[10px] gap-2 transition-all"
                    >
                        <Settings size={16} />
                        CAMPAIGN SETTINGS
                    </Button>
                    <Button
                        onClick={handleSync}
                        disabled={isSimulatingLink}
                        className={cn(
                            "h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:opacity-90 relative overflow-hidden",
                            isSimulatingLink && "opacity-80"
                        )}
                    >
                        {isSimulatingLink && (
                            <motion.div 
                                className="absolute left-0 top-0 h-full bg-white/20"
                                initial={{ width: 0 }}
                                animate={{ width: `${syncProgress}%` }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {isSimulatingLink ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                            REFRESH DATA
                        </span>
                    </Button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
                {[
                    { label: "Total Sent", value: "4.2K", icon: <Send size={20} className="text-primary" />, sub: "Last 30 days" },
                    { label: "Open Rate", value: "82%", icon: <Eye size={20} className="text-primary" />, sub: "+4% vs previous" },
                    { label: "CTR Rate", value: "12.4%", icon: <MousePointer2 size={20} className="text-primary" />, sub: "Engagement High" },
                    { label: "Status", value: "ONLINE", icon: <ShieldCheck size={20} className="text-emerald-500" />, sub: "Encryption: TLS 1.3" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card group hover:shadow-xl transition-all cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/20 transition-colors text-primary font-bold">{stat.icon}</div>
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
                <Card className="xl:col-span-2 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card flex flex-col h-full">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Automation Templates</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-none">Live communication channels & triggers</span>
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
                                        <th className="px-8 py-5 w-[25%]">Trigger Event</th>
                                        <th className="px-8 py-5 w-[20%]">Performance</th>
                                        <th className="px-8 py-5 w-[15%] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {NOTIFICATION_TEMPLATES.map((tpl) => (
                                        <tr key={tpl.id} className="hover:bg-muted/50 transition-all duration-500 group cursor-pointer border-b border-border last:border-0 h-24">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm", tpl.bg, tpl.color)}>
                                                        <Mail size={16} />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[11px] font-black italic text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-none truncate">{tpl.name}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-0 group-hover:opacity-40 transition-all duration-500 translate-y-1 group-hover:translate-y-0">{tpl.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border/50 rounded-xl w-fit group-hover:border-primary/20 transition-all">
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

                {/* Performance Analytics & Channel Stats */}
                <div className="flex flex-col gap-8 overflow-hidden">
                    <Card className="rounded-[2.5rem] border-border shadow-sm bg-card p-6 flex flex-col gap-4 overflow-hidden h-[300px]">
                        <div className="flex items-center justify-between px-2">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">System Throughput</span>
                                <span className="text-2xl font-black italic text-foreground tracking-tighter uppercase leading-none mt-1">99.8% Success</span>
                             </div>
                             <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold">
                                <BarChart3 size={18} />
                             </div>
                        </div>
                        <div className="flex-1 w-full h-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PERFORMANCE_DATA}>
                                    <defs>
                                        <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="throughput" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorThroughput)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border shadow-sm bg-card p-8 flex flex-col gap-8">
                        <CardTitle className="text-xl font-black italic uppercase tracking-tight">Channel Capacity</CardTitle>
                        <div className="flex flex-col gap-6">
                            {[
                                { label: "Email Delivery", val: 85, icon: <Mail size={16} />, color: "bg-blue-500" },
                                { label: "SMS Gateway", val: 12, icon: <Smartphone size={16} />, color: "bg-emerald-500" },
                                { label: "WhatsApp Link", val: 3, icon: <MessageSquare size={16} />, color: "bg-green-500" }
                            ].map((channel, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground opacity-60">{channel.icon}</span>
                                            <span className="text-[10px] font-black uppercase text-foreground tracking-widest italic">{channel.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-muted-foreground opacity-60 italic">{channel.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${channel.val}%` }}
                                            transition={{ duration: 2, delay: i * 0.2 }}
                                            className={cn("h-full", channel.color)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-muted border border-border rounded-2xl flex items-center gap-3 mt-4">
                            <ShieldCheck size={16} className="text-primary" />
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] italic opacity-80">TLS 1.3 Active</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
