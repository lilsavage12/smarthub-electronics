"use client"

import React, { useState, useEffect } from "react"
import { 
    Users, User, Mail, Send, Trash2, 
    ShieldCheck, Activity, Loader2,
    Settings as SettingsIcon,
    ChevronRight,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-store"

export default function AdminSettingsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<"staff" | "profile">("staff")
    const [inviting, setInviting] = useState(false)
    const [email, setEmail] = useState("")
    const [invites, setInvites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchInvites = async () => {
        try {
            const res = await fetch("/api/invites")
            if (res.ok) {
                const data = await res.json()
                setInvites(data)
            }
        } catch (error) {
            console.error("Failed to fetch invites:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvites()
    }, [])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setInviting(true)
        
        try {
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    token,
                    role: "ADMIN",
                    status: "PENDING"
                })
            })

            if (res.ok) {
                toast.success(`Access invite dispatched to ${email}`)
                setEmail("")
                fetchInvites()
            } else {
                const errData = await res.json().catch(() => ({}))
                console.error("Invite send failed:", errData)
                throw new Error(errData.error || "Failed to send invite")
            }
        } catch (error: any) {
            console.error("Invite Handle Error:", error)
            toast.error(`Error: ${error.message || "Could not send invite"}`)
        } finally {
            setInviting(false)
        }
    }

    const deleteInvite = async (id: string) => {
        try {
            const res = await fetch(`/api/invites/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Invite revoked successfully")
                fetchInvites()
            } else {
                toast.error("Failed to revoke invite")
            }
        } catch (error) {
            toast.error("Error revoking invite")
        }
    }

    return (
        <div className="flex flex-col gap-12 max-w-[1400px] mx-auto p-4 md:p-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">Settings</h1>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-60">
                    Manage your <span className="text-foreground">Account</span> and <span className="text-primary italic">Team Access</span> preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Navigation Matrix */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <button 
                        onClick={() => setActiveTab("staff")}
                        className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group",
                            activeTab === "staff" 
                                ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Users size={18} className={cn(activeTab === "staff" ? "animate-pulse" : "group-hover:scale-110")} />
                        Staff Access
                    </button>
                    <button 
                        onClick={() => setActiveTab("profile")}
                        className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group",
                            activeTab === "profile" 
                                ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <User size={18} className={cn(activeTab === "profile" ? "animate-pulse" : "group-hover:scale-110")} />
                        Your Profile
                    </button>
                </div>

                {/* Main Control Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeTab === "staff" && (
                            <motion.div 
                                key="staff"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-10"
                            >
                                {/* Add New Staff Admin */}
                                <Card className="rounded-[3rem] border-border bg-card p-10 lg:p-16 shadow-2xl shadow-black/5 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                                    
                                    <div className="flex flex-col gap-10 relative z-10">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none">Add New Staff</h2>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                                                Invite another administrator to manage the website.
                                            </span>
                                        </div>

                                        <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
                                            <div className="relative flex-1 group">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <Input 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="EMAIL@ADDRESS.COM"
                                                    className="h-16 pl-16 pr-8 bg-muted/30 border-border rounded-2xl font-black italic text-xs uppercase focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                                                />
                                            </div>
                                            <Button 
                                                type="submit"
                                                disabled={inviting}
                                                className="h-16 px-12 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-105 transition-all gap-3"
                                            >
                                                {inviting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} 
                                                Send Invite
                                            </Button>
                                        </form>
                                    </div>
                                </Card>

                                {/* Pending Invites Matrix */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Pending Invites</span>
                                        <div className="bg-muted px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-60">{invites.length} Active</div>
                                    </div>

                                    {invites.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {invites.map((invite) => (
                                                <Card key={invite.id} className="rounded-2xl border-border bg-card p-6 flex items-center justify-between group hover:border-primary/20 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-primary/5 text-primary">
                                                            <Mail size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black italic uppercase tracking-widest text-foreground">{invite.email}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Pending Onboarding • Role: {invite.role}</span>
                                                                <button 
                                                                    onClick={() => {
                                                                        const link = `${window.location.origin}/hub-control/invite/${invite.token}`
                                                                        navigator.clipboard.writeText(link)
                                                                        toast.success("Invite link copied to clipboard")
                                                                    }}
                                                                    className="text-primary hover:underline text-[8px] font-black uppercase tracking-widest ml-2"
                                                                >
                                                                    Copy Link
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => deleteInvite(invite.id)}
                                                            className="text-red-500 hover:bg-red-500/10 rounded-xl"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="rounded-[2.5rem] border-dashed border-2 border-border bg-muted/5 p-16 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Activity size={40} className="text-muted-foreground" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-muted-foreground">No Pending Invites</span>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "profile" && (
                            <motion.div 
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-10"
                            >
                                <Card className="rounded-[3rem] border-border bg-card p-10 lg:p-16 shadow-2xl shadow-black/5 flex flex-col gap-12">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-3xl bg-primary text-white flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/20 italic uppercase">
                                            {user?.displayName?.[0] || user?.email?.[0] || "A"}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{user?.displayName || "Administrator"}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">USER ID: {user?.id.substring(0, 8) || "MASTER-ADMIN"}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Display Name</label>
                                            <Input defaultValue={user?.displayName || ""} className="h-14 rounded-2xl bg-muted/30 border-border px-6 font-black italic uppercase text-xs" />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Interface Language</label>
                                            <Input defaultValue="ENGLISH (SIMPLE)" disabled className="h-14 rounded-2xl bg-muted/30 border-border px-6 font-black italic uppercase text-xs opacity-50" />
                                        </div>
                                    </div>

                                    <Button className="h-16 rounded-2xl bg-foreground text-background font-black italic uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5">
                                        Update Profile
                                    </Button>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
