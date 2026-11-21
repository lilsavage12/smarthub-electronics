"use client"

import React, { useState, useEffect } from "react"
import { 
    Users, User, Mail, Send, Trash2, 
    ShieldCheck, Activity, Loader2,
    Settings as SettingsIcon,
    ChevronRight,
    Search,
    CheckCircle2,
    AlertCircle
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
    const [activeTab, setActiveTab] = useState<"staff" | "profile" | "email">("email")
    const [inviting, setInviting] = useState(false)
    const [email, setEmail] = useState("")
    const [invites, setInvites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Resend test email state
    const [testEmail, setTestEmail] = useState("")
    const [isSendingTest, setIsSendingTest] = useState(false)
    const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null)

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
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    role: "STAFF"
                })
            })

            if (res.ok) {
                toast.success(`Access invite dispatched to ${email}`)
                setEmail("")
                fetchInvites()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to dispatch invite")
            }
        } catch (error) {
            toast.error("Internal processing error")
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

    const handleSendTestEmail = async () => {
        setIsSendingTest(true)
        setTestResult(null)
        const toastId = toast.loading("Connecting to Resend API...")

        try {
            const res = await fetch("/api/admin/test-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toEmail: testEmail.trim() || undefined
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setTestResult({ success: true, message: data.message })
                toast.success("Test email dispatched successfully via Resend!", { id: toastId })
            } else {
                setTestResult({ success: false, message: data.error || "Failed to send test email" })
                toast.error(data.error || "Resend API rejected request", { id: toastId })
            }
        } catch (e: any) {
            setTestResult({ success: false, message: e.message || "Network error" })
            toast.error("Could not connect to test endpoint", { id: toastId })
        } finally {
            setIsSendingTest(false)
        }
    }

    return (
        <div className="flex flex-col gap-10 max-w-[1400px] mx-auto p-4 md:p-8">
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none font-f1">Settings</h1>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.25em] font-f1">
                    Manage your <span className="text-foreground">Email Notifications</span>, <span className="text-foreground">Account</span>, and <span className="text-[#e10600]">Team Access</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Navigation Matrix */}
                <div className="lg:col-span-3 flex flex-col gap-3 font-f1">
                    <button 
                        onClick={() => setActiveTab("email")}
                        className={cn(
                            "flex items-center gap-3.5 p-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest cursor-pointer",
                            activeTab === "email" 
                                ? "bg-[#e10600] text-white shadow-xl shadow-[#e10600]/20" 
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                    >
                        <Mail size={16} />
                        Email & Resend API
                    </button>
                    <button 
                        onClick={() => setActiveTab("staff")}
                        className={cn(
                            "flex items-center gap-3.5 p-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest cursor-pointer",
                            activeTab === "staff" 
                                ? "bg-[#e10600] text-white shadow-xl shadow-[#e10600]/20" 
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                    >
                        <Users size={16} />
                        Staff Access
                    </button>
                    <button 
                        onClick={() => setActiveTab("profile")}
                        className={cn(
                            "flex items-center gap-3.5 p-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest cursor-pointer",
                            activeTab === "profile" 
                                ? "bg-[#e10600] text-white shadow-xl shadow-[#e10600]/20" 
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                    >
                        <User size={16} />
                        Your Profile
                    </button>
                </div>

                {/* Main Control Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">

                        {/* EMAIL & RESEND API TAB (One-Click Verification) */}
                        {activeTab === "email" && (
                            <motion.div 
                                key="email"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-8 font-f1"
                            >
                                {/* One Click Resend Tester Card */}
                                <Card className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-[#111114] p-8 md:p-10 shadow-xl space-y-6">
                                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                                                Resend API Email Verification
                                            </h2>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">
                                                Test your Resend email setup with one click.
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#e10600]/10 text-[#e10600] border border-[#e10600]/20">
                                            <Mail size={20} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                                Send Test Email To:
                                            </label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input 
                                                    type="email"
                                                    value={testEmail}
                                                    onChange={e => setTestEmail(e.target.value)}
                                                    placeholder="Enter your email address (or leave empty for admin default)"
                                                    className="flex-1 bg-muted/30 dark:bg-black/50 border border-border dark:border-white/15 h-12 px-4 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-[#e10600] font-sans"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={isSendingTest}
                                                    onClick={handleSendTestEmail}
                                                    className="bg-[#e10600] hover:bg-[#c90500] text-white text-xs font-black uppercase tracking-widest px-8 h-12 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-lg shadow-[#e10600]/20"
                                                >
                                                    {isSendingTest ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                                    <span>{isSendingTest ? "DISPATCHING..." : "SEND TEST EMAIL (1-CLICK)"}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Result Display Banner */}
                                        {testResult && (
                                            <div className={cn(
                                                "p-4 rounded-xl border flex items-start gap-3 mt-4",
                                                testResult.success 
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                                    : "bg-destructive/10 border-destructive/30 text-destructive"
                                            )}>
                                                {testResult.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                                                <div className="text-xs font-sans leading-relaxed">
                                                    <span className="font-black uppercase block font-f1 tracking-wider">
                                                        {testResult.success ? "SUCCESS" : "DISPATCH FAILED"}
                                                    </span>
                                                    <span>{testResult.message}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Configuration Guide */}
                                    <div className="bg-muted/20 dark:bg-black/40 border border-border/40 dark:border-white/5 p-6 rounded-xl space-y-3 font-sans">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-f1 block">
                                            ACTIVE ENVIRONMENT VARIABLES (.env)
                                        </span>
                                        <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
                                            <p>• <span className="text-foreground">RESEND_API_KEY</span>: Starts with <code className="text-[#e10600]">re_...</code> from resend.com/api-keys</p>
                                            <p>• <span className="text-foreground">ADMIN_NOTIFICATION_EMAIL</span>: Where new order notices arrive</p>
                                            <p>• <span className="text-foreground">RESEND_FROM_EMAIL</span>: <code className="text-emerald-400">F1GEAR KE &lt;onboarding@resend.dev&gt;</code> (or your verified domain)</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* STAFF TAB */}
                        {activeTab === "staff" && (
                            <motion.div 
                                key="staff"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-8 font-f1"
                            >
                                <Card className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-[#111114] p-8 md:p-10 shadow-xl space-y-6">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground">Add New Staff</h2>
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-sans">
                                            Dispatch an invitation link to a new team member.
                                        </span>
                                    </div>

                                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="STAFF@EMAIL.COM"
                                            className="flex-1 bg-muted/30 dark:bg-black/50 border border-border dark:border-white/15 h-12 px-4 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-[#e10600] font-sans"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={inviting}
                                            className="bg-[#e10600] hover:bg-[#c90500] text-white text-xs font-black uppercase tracking-widest px-8 h-12 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#e10600]/20"
                                        >
                                            {inviting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                            <span>Send Invite</span>
                                        </button>
                                    </form>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Pending Invitations</h3>
                                    {invites.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {invites.map((invite) => (
                                                <Card key={invite.id} className="p-5 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-[#111114] flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xs font-black uppercase tracking-wide text-foreground block">{invite.email}</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground font-sans">{invite.role || 'STAFF'}</span>
                                                    </div>
                                                    <button onClick={() => deleteInvite(invite.id)} className="text-destructive/60 hover:text-destructive p-2">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="rounded-xl border-dashed border-2 border-border/40 p-8 text-center text-muted-foreground text-xs font-sans">
                                            No pending team invitations.
                                        </Card>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* PROFILE TAB */}
                        {activeTab === "profile" && (
                            <motion.div 
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-8 font-f1"
                            >
                                <Card className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-[#111114] p-8 md:p-10 shadow-xl space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-[#e10600] text-white flex items-center justify-center font-black text-2xl uppercase">
                                            {user?.displayName?.[0] || user?.email?.[0] || "A"}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase text-foreground leading-none">{user?.displayName || "Administrator"}</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e10600] mt-1 block font-sans">
                                                ROLE: {user?.role || "SYSTEM ADMIN"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Display Name</label>
                                            <Input defaultValue={user?.displayName || "System Administrator"} className="h-11 rounded-xl bg-muted/20 border-border" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Email</label>
                                            <Input defaultValue={user?.email || "admin@f1gear.ke"} disabled className="h-11 rounded-xl bg-muted/20 border-border opacity-60" />
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
