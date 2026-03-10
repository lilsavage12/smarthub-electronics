"use client"

import React, { useState, useEffect } from "react"
import {
    RefreshCcw, Database, Zap, ShieldCheck,
    AlertCircle, CheckCircle2, Cloud, Server,
    Wifi, Activity, Box, Lock, Clock, Info,
    ChevronDown, ChevronUp, Download, HardDrive,
    Signal, Cpu, Globe
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function SystemSyncPage() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [lastSync, setLastSync] = useState(new Date())
    const [syncProgress, setSyncProgress] = useState(0)
    const [latency, setLatency] = useState(14)

    const triggerManualSync = () => {
        setIsSyncing(true)
        setSyncProgress(0)
        const toastId = toast.loading("Initiating global data synchronization protocol...")

        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsSyncing(false)
                    setLastSync(new Date())
                    toast.success("All systems synchronized successfully", { id: toastId })
                    return 100
                }
                return prev + 5
            })
        }, 100)
    }

    return (
        <div className="flex flex-col gap-10 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">System Syncronization</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Monitor and manage real-time data integrity and server latency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={triggerManualSync}
                        disabled={isSyncing}
                        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20 transition-all border-none"
                    >
                        <RefreshCcw size={18} className={cn(isSyncing && "animate-spin")} />
                        {isSyncing ? `SYNCING ${syncProgress}%` : "INITIATE PROTOCOL SYNC"}
                    </Button>
                </div>
            </div>

            {/* Connection Diagnostics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Core Database", value: "CONNECTED", status: "Healthy", icon: <Database className="text-emerald-500" />, sub: "Firestore GCP Instance", bg: "bg-emerald-500/5" },
                    { label: "Asset Storage", value: "94.2%", status: "Nominal", icon: <Cloud className="text-blue-500" />, sub: "5.8GB / 100GB Used", bg: "bg-blue-500/5" },
                    { label: "Network Latency", value: `${latency}ms`, status: "Low", icon: <Activity className="text-amber-500" />, sub: "Regional Avg: 18ms", bg: "bg-amber-500/5" },
                    { label: "Client Listeners", value: "842", status: "Active", icon: <Wifi className="text-primary" />, sub: "Encrypted WebSocket Sockets", bg: "bg-primary/5" },
                ].map((s, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className={cn("p-3 w-fit rounded-xl transition-colors", s.bg)}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black italic tracking-tighter">{s.value}</span>
                                <Badge className="bg-transparent border-primary/20 text-primary text-[6px] font-black">{s.status}</Badge>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                            <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-1">{s.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Large Diagnostics Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 rounded-[2.5rem] border-border p-8 flex flex-col gap-8 shadow-sm bg-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                                <Server size={20} className="text-primary" />
                                Infrastructure Health
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">System load and database query performance monitoring</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Database Query Utilization</span>
                                <span className="text-xs font-black italic">42% • NORMAL</span>
                            </div>
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                                <motion.div initial={{ width: 0 }} animate={{ width: "42%" }} className="h-full bg-primary rounded-full" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Retrieval Speed</span>
                                <span className="text-xs font-black italic">148ms • FAST</span>
                            </div>
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                                <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} className="h-full bg-emerald-500 rounded-full" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">API Throughput (Requests/sec)</span>
                                <span className="text-xs font-black italic">1,248 RPS • STABLE</span>
                            </div>
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                                <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-blue-500 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-5 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-between grayscale hover:grayscale-0 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-muted rounded-xl">
                                <Globe size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest">Master Region Status</span>
                                <span className="text-xs font-bold text-emerald-500 uppercase">US-EAST-1 (Active-Primary)</span>
                            </div>
                        </div>
                        <div className="h-10 px-4 rounded-xl border border-border flex items-center justify-center text-[8px] font-black uppercase tracking-widest opacity-60">
                            Auto-Scaling Enabled
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-border p-8 flex flex-col gap-6 shadow-sm bg-card h-full">
                        <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            Sync History
                        </h3>
                        <div className="flex-1 flex flex-col gap-4 no-scrollbar overflow-y-auto max-h-[400px]">
                            {[
                                { status: "Success", type: "Full", time: "2 mins ago", msg: "Global registry updated" },
                                { status: "Success", type: "Delta", time: "18 mins ago", msg: "Inventory diff applied" },
                                { status: "Warning", type: "Retried", time: "45 mins ago", msg: "Image server handshake" },
                                { status: "Success", type: "Full", time: "1 hour ago", msg: "Logistics data reconciled" },
                                { status: "Success", type: "Delta", time: "2 hours ago", msg: "Auth session cleanup" },
                            ].map((h, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-border/10 group hover:bg-muted/40 transition-all">
                                    <div className={cn("p-2 rounded-lg mt-1", h.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500')}>
                                        {h.status === 'Success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-center w-full min-w-40">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground">{h.type} SYNC</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">{h.time}</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-muted-foreground mt-1 italic">{h.msg}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Technical Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="rounded-[2.5rem] border-border p-8 flex flex-col gap-4 shadow-sm bg-muted/20">
                    <Cpu className="text-primary mb-2" size={24} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Processing Engine</h4>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic">
                        SmartHub uses a custom abstraction layer over Firebase to ensure offline capabilities and lightning-fast state reconciliation.
                    </p>
                </Card>
                <Card className="rounded-[2.5rem] border-border p-8 flex flex-col gap-4 shadow-sm bg-muted/20">
                    <Lock className="text-primary mb-2" size={24} />
                    <h4 className="text-xs font-black uppercase tracking-widest">End-to-End Encryption</h4>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic">
                        Every synchronization sequence is signed with a cryptographic token to prevent man-in-the-middle data injection.
                    </p>
                </Card>
                <Card className="rounded-[2.5rem] border-border p-8 flex flex-col gap-4 shadow-sm bg-muted/20">
                    <Signal className="text-primary mb-2" size={24} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Real-time Propagator</h4>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic">
                        Changes made in the Admin vault are broadcasted via Cloud Messaging to all active web and mobile installations.
                    </p>
                </Card>
            </div>
        </div>
    )
}
