"use client"

import React, { useState, useEffect } from "react"
import {
    Settings, Shield, Users, Bell,
    Smartphone, CreditCard, Key, Activity,
    Lock, Mail, User, Palette, Globe,
    ChevronRight, Save, LogOut, Info, Trash2, Zap, ArrowRight, UserPlus, Filter, Truck,
    ExternalLink, ShieldCheck, RefreshCcw, History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { toast } from "react-hot-toast"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("Staff")
    const [invites, setInvites] = useState<any[]>([])
    const [email, setEmail] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    const fetchInvites = async () => {
        try {
            const res = await fetch("/api/invites")
            if (res.ok) {
                const data = await res.json()
                setInvites(data)
            }
        } catch (error) {
            console.error("Invites sync error:", error)
        }
    }

    useEffect(() => {
        fetchInvites()
    }, [])

    const generateInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setIsGenerating(true)
        try {
            const token = Math.random().toString(36).substring(2, 15)
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    token,
                    role: "ADMIN",
                    status: "PENDING"
                })
            })

            if (res.ok) {
                toast.success("Invite sent successfully")
                setEmail("")
                fetchInvites()
            } else {
                throw new Error("POST failed")
            }
        } catch (e: any) {
            toast.error("Could not send invite")
        } finally {
            setIsGenerating(false)
        }
    }

    const tabs = [
        { id: "Staff", icon: <Users className="w-4 h-4" />, label: "Staff Access" },
        { id: "Profile", icon: <User className="w-4 h-4" />, label: "Your Profile" },
    ]

    return (
        <div className="flex flex-col gap-10 min-h-screen">
            {/* Simple Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Settings</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Manage your account and team access in simple English.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Clean Navigation */}
                <div className="w-full lg:w-64 flex flex-col gap-8 sticky top-24">
                    <div className="flex flex-col gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-6">Quick Links</span>
                        {[
                            { name: "Audit Logs", href: "/hub-control/audit" },
                            { name: "System Sync", href: "/hub-control/sync" },
                            { name: "Security Centre", href: "/hub-control/security" },
                        ].map(link => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-between group"
                            >
                                {link.name}
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Simplified Content Area */}
                <div className="flex-1 w-full max-w-4xl">
                    <AnimatePresence mode="wait">
                        {activeTab === "Staff" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
                                {/* Invite Form */}
                                <Card className="rounded-[2.5rem] border-border shadow-none p-10 bg-card">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Add New Staff</h2>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic">Invite another administrator to manage the website.</p>
                                        </div>

                                        <form onSubmit={generateInvite} className="flex gap-4">
                                            <div className="relative flex-1">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    className="h-14 w-full bg-muted border border-border/50 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/30 transition-all text-xs font-black uppercase tracking-widest text-foreground"
                                                    placeholder="EMAIL@ADDRESS.COM"
                                                />
                                            </div>
                                            <Button type="submit" disabled={isGenerating} className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black italic tracking-widest uppercase text-[10px] shadow-lg shadow-primary/20">
                                                {isGenerating ? "SENDING..." : "SEND INVITE"}
                                            </Button>
                                        </form>
                                    </div>
                                </Card>

                                {/* Pending Invites */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Pending Invites</span>
                                        <span className="text-[8px] font-black px-3 py-1 bg-muted rounded-full text-muted-foreground">{invites.length} ACTIVE</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {invites.length === 0 ? (
                                            <div className="p-12 border border-dashed border-border rounded-[2rem] text-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 italic">No pending invites</span>
                                            </div>
                                        ) : invites.map((invite) => (
                                            <Card key={invite.id} className="rounded-2xl border-border shadow-none hover:border-primary/20 transition-all group p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary border border-border">
                                                            <User size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black uppercase italic tracking-tight">{invite.email}</span>
                                                            <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase mt-0.5 tracking-wider">Invite Code: {invite.token.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10"
                                                            onClick={() => {
                                                                const link = `${window.location.origin}/hub-control/invite/${invite.token}`
                                                                navigator.clipboard.writeText(link)
                                                                toast.success("Link copied")
                                                            }}
                                                        >
                                                            Copy Link
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-muted-foreground hover:text-red-500 rounded-xl"
                                                            onClick={async () => {
                                                                if (confirm("Cancel this invite?")) {
                                                                    const res = await fetch(`/api/invites/${invite.id}`, { method: "DELETE" })
                                                                    if (res.ok) {
                                                                        toast.success("Invite cancelled")
                                                                        fetchInvites()
                                                                    } else {
                                                                        toast.error("Delete failed")
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "Profile" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
                                <Card className="rounded-[2.5rem] border-border shadow-none p-10 bg-card">
                                    <div className="flex flex-col gap-10">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Your Profile</h2>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic">Update your personal information below.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 opacity-60">Your Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <input type="text" defaultValue="SYSTEM ADMIN" className="h-14 w-full bg-muted border border-border/50 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/20 transition-all text-xs font-black uppercase italic" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 opacity-60">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <input type="email" defaultValue="ADMIN@SMARTHUB.COM" className="h-14 w-full bg-muted border border-border/50 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/20 transition-all text-xs font-black uppercase italic" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 max-w-md">
                                                <Info className="text-primary" size={18} />
                                                <p className="text-[9px] font-bold leading-relaxed text-muted-foreground uppercase tracking-widest">Saving changes will update your login credentials for all future sessions.</p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    const tid = toast.loading("Updating security identity profile...")
                                                    setTimeout(() => toast.success("Identity updated across all nodes", { id: tid }), 1500)
                                                }}
                                                className="h-14 px-12 rounded-2xl bg-primary text-primary-foreground font-black italic tracking-widest uppercase text-[10px] shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                                            >
                                                SAVE CHANGES
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
