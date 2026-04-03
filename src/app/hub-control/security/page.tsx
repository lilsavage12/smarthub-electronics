"use client"

import React, { useState } from "react"
import {
    Shield, Lock, Fingerprint, Key,
    Monitor, MapPin, Smartphone,
    AlertTriangle, ShieldCheck, ShieldAlert,
    Eye, MoreHorizontal, User,
    LogOut, Database, RefreshCcw,
    Cpu, Globe, Zap, Clock, Info,
    ChevronRight, ChevronDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"

export default function SecurityCentrePage() {
    const router = useRouter()
    const [securityScore, setSecurityScore] = useState(98)
    const [activeSessions, setActiveSessions] = useState([
        { id: 'S-741', device: 'Chrome / macOS', ip: '192.168.1.1', location: 'London, UK', status: 'Current', time: 'Active Now' },
        { id: 'S-742', device: 'SmartHub Mobile / iOS', ip: '10.0.0.42', location: 'Paris, FR', status: 'Authorized', time: '14 mins ago' },
        { id: 'S-743', device: 'Firefox / Windows 11', ip: '172.16.0.5', location: 'Dubai, UAE', status: 'Authorized', time: '2 hours ago' },
    ])

    const regenerateAPIKey = () => {
        const toastId = toast.loading("Updating master security key...")
        setTimeout(() => {
            toast.success("Security keys updated across all regions", { id: toastId })
        }, 2000)
    }

    const revokeAllSessions = () => {
        if (confirm("Revoke all sessions? You will need to re-authenticate on all devices.")) {
            setActiveSessions(prev => prev.filter(s => s.status === 'Current'))
            toast.success("All remote sessions terminated")
        }
    }

    const revokeSession = (id: string, isCurrent: boolean) => {
        if (isCurrent) return toast.error("Cannot revoke current session")
        setActiveSessions(prev => prev.filter(s => s.id !== id))
        toast.success("Session revoked")
    }

    return (
        <div className="flex flex-col gap-10 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Security Controls</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Master control for administrative access, encryption, and audit records.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={regenerateAPIKey}
                        className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-red-500/20 transition-all"
                    >
                        <RefreshCcw size={18} />
                        UPDATE ACCESS KEYS
                    </Button>
                </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-2xl border-border shadow-sm p-6 flex flex-col gap-4 bg-primary text-primary-foreground relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <ShieldCheck size={32} className="text-white fill-white/20 mb-2" />
                    <div className="flex flex-col">
                        <span className="text-4xl font-black italic tracking-tighter leading-tight">{securityScore}%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/80">Security Grade: Optimal</span>
                    </div>
                </Card>

                {[
                    { label: "Active Roles", value: "3 Types", icon: <User className="text-blue-500" />, sub: "Admin, Mgr, Aud", bg: "bg-blue-500/5" },
                    { label: "Encrypted DB", value: "AES-256", icon: <Database className="text-amber-500" />, sub: "Data Encryption", bg: "bg-amber-500/5" },
                    { label: "IP Whitelist", value: "ENABLED", icon: <Globe className="text-emerald-500" />, sub: "Restrictive Mode", bg: "bg-emerald-500/5" },
                ].map((s, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className={cn("p-3 w-fit rounded-xl transition-colors", s.bg)}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black italic tracking-tighter">{s.value}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                            <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-1 tracking-wider">{s.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Sessions Matrix */}
                <Card className="col-span-2 rounded-[2.5rem] border-border p-8 flex flex-col gap-8 shadow-sm bg-card relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1" id="active-sessions">
                            <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                                <Fingerprint size={20} className="text-primary" />
                                Active Account Sessions
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Monitor and manage all current administrative sessions</span>
                        </div>
                        <Button onClick={revokeAllSessions} variant="ghost" className="text-[9px] font-black uppercase">Revoke All Sessions</Button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {activeSessions.map((session, i) => (
                            <div key={session.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted/20 border border-border/10 group hover:bg-muted/40 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 bg-card rounded-2xl border border-border/50 flex items-center justify-center text-primary shadow-sm">
                                        {session.device.includes('Mobile') ? <Smartphone size={24} /> : <Monitor size={24} />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-foreground tracking-tight italic">{session.device}</span>
                                            {session.status === 'Current' && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[6px] rounded-full uppercase">CURRENT SESSION</Badge>}
                                        </div>
                                        <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Globe size={10} /> {session.ip}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={10} /> {session.location}</span>
                                            <span className="flex items-center gap-1.5 opacity-60 italic">{session.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => revokeSession(session.id, session.status === 'Current')}
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <LogOut size={20} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Privacy & Audit Info */}
                <div className="flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-border p-8 flex flex-col gap-8 bg-card shadow-sm h-full">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                                <Key size={16} className="text-primary" />
                                Security System
                            </h3>
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic opacity-80 mt-2">
                                SmartHub utilizes a secure infrastructure that automatically detects and prevents brute-force login attempts.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {[
                                { label: "2FA Enforcement", status: "ENABLED", icon: <Shield size={16} />, color: "text-emerald-500" },
                                { label: "Session Expiry", status: "15 MINS", icon: <Clock size={16} />, color: "text-amber-500" },
                                { label: "Failed Attempts", status: "0 BLOCKED", icon: <AlertTriangle size={16} />, color: "text-emerald-500" },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/10">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg bg-muted border border-border/50", p.color)}>
                                            {p.icon}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">{p.label}</span>
                                    </div>
                                    <span className={cn("text-[10px] font-black italic tracking-widest", p.color)}>{p.status}</span>
                                </div>
                            ))}
                        </div>

                        <div
                            onClick={() => router.push("/hub-control/audit")}
                            className="mt-auto p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col gap-3 group cursor-pointer hover:bg-primary/10 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Security Audit Log</span>
                                <ChevronRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.1em] leading-relaxed">
                                View full cryptographic audit history for this month.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Visual Security Timeline Placeholder */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 flex flex-col gap-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Clock size={20} className="text-primary" />
                            Security Alert Timeline
                        </h3>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">High-priority alerts and system integrity reports</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-l border-border/50 ml-4">
                    {[
                        { time: '14:22:15', title: 'Security Key Update Success', desc: 'New master keys updated across US and EU servers', type: 'SUCCESS' },
                        { time: '09:12:04', title: 'Unusual IP Detected', desc: 'Blocked attempt from unauthorized location (VPN Detected)', type: 'WARNING' },
                        { time: 'Yesterday', title: 'Admin Permissions Modified', desc: 'User privileges updated to Admin status', type: 'INFO' },
                    ].map((t, i) => (
                        <div key={i} className="flex gap-8 relative pb-8 group">
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10" />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-[10px] font-black italic text-primary uppercase whitespace-nowrap">{t.time}</span>
                                    <span className="text-sm font-black italic uppercase tracking-tight text-foreground">{t.title}</span>
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground italic max-w-2xl">{t.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
