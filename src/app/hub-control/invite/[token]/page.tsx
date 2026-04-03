"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, Zap, ShieldCheck, Mail, Lock, ArrowRight, UserPlus, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-store"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export default function AdminInvite() {
    const { token } = useParams()
    const router = useRouter()

    const [displayName, setDisplayName] = useState("ADMINISTRATOR")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
    const [inviteDoc, setInviteDoc] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const { setAuth } = useAuth()

    useEffect(() => {
        validateToken()
    }, [token])

    const validateToken = async () => {
        if (!token) return

        try {
            const res = await fetch(`/api/invites/verify/${token}`)
            if (res.ok) {
                const invite = await res.json()
                setInviteDoc(invite)
                setEmail(invite.email)
                setIsValidToken(true)
            } else {
                setIsValidToken(false)
            }
        } catch (e) {
            console.error(e)
            setIsValidToken(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Error: Passwords do not match")
            return
        }

        if (password.length < 8) {
            toast.error("Error: Password too weak (min 8 chars)")
            return
        }

        setIsProcessing(true)

        try {
            // 1. Create User in Local DB with correct role from invite
            const regRes = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    displayName,
                    role: inviteDoc?.role || "ADMIN"
                })
            })

            const regData = await regRes.json()
            if (!regRes.ok) throw new Error(regData.error || "Onboarding Failed")

            // 2. Mark Invite as ACCEPTED to prevent reuse
            await fetch(`/api/invites/accept/${token}`, { method: "POST" })

            // 3. Set Auth State
            setAuth(regData.user)
            localStorage.setItem("sh_admin_user", JSON.stringify(regData.user))

            toast.success("Identity verified. Access granted.", {
                style: {
                    background: '#0F0F12',
                    color: '#fff',
                    border: '1px solid #1A1A1D',
                    fontSize: '10px',
                    fontWeight: '900',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }
            })

            router.push("/hub-control")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Registration Failed")
            setIsProcessing(false)
        }
    }

    if (isValidToken === null) {
        return <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 animate-pulse">
                <ShieldCheck className="w-16 h-16 text-primary" />
                <span className="text-[10px] font-black uppercase text-foreground tracking-[0.4em]">Verifying Invite Link...</span>
            </div>
        </div>
    }

    if (isValidToken === false) {
        return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-8">
            <div className="absolute top-10 right-10">
                <ThemeToggle />
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-[3rem] p-12 md:p-16 text-center flex flex-col gap-8 max-w-lg shadow-2xl">
                <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-destructive/20">
                    <Zap className="w-10 h-10 text-destructive" />
                </div>
                <div className="flex flex-col gap-3">
                    <h1 className="text-4xl font-black font-outfit uppercase italic tracking-tighter text-foreground">Token <span className="text-destructive">Expired</span></h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed tracking-widest px-4">This administrative link is no longer valid or has already been used.</p>
                </div>
                <Button 
                    variant="outline" 
                    className="h-16 rounded-2xl border-border text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all" 
                    onClick={() => router.push("/")}
                >
                    Return to Homepage
                </Button>
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-inter">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/[0.08] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

            {/* Theme Control Matrix */}
            <div className="absolute top-8 right-8 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="w-full max-w-lg z-10"
            >
                <div className="bg-card/40 backdrop-blur-3xl border border-border rounded-[3.5rem] p-10 md:p-16 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />

                    <div className="relative z-10 flex flex-col items-center gap-12">
                        <div className="bg-primary shadow-2xl shadow-primary/20 p-5 rounded-3xl border border-white/10 ring-8 ring-primary/5">
                            <UserPlus className="w-10 h-10 text-white" />
                        </div>

                        <div className="text-center flex flex-col gap-3">
                            <h1 className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter italic leading-none text-foreground">
                                Account <span className="text-primary italic">Setup</span>
                            </h1>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-1 opacity-70">Administrative Onboarding Matrix</p>
                        </div>

                        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-8">
                            <div className="flex flex-col gap-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-foreground ml-2 italic">Authorized Identity</label>
                                <div className="relative group/email">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
                                        className="w-full bg-muted/30 border border-border rounded-[1.5rem] h-16 pl-16 pr-6 outline-none text-xs font-black uppercase tracking-widest text-foreground opacity-60 italic"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-foreground ml-2 italic">Full Identity</label>
                                <div className="relative group/identity">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary transition-transform group-focus-within/identity:scale-110">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="YOUR FULL NAME"
                                        className="w-full bg-muted/40 border border-border rounded-[1.5rem] h-16 pl-16 pr-6 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-black italic uppercase tracking-[0.2em] text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-foreground ml-2 italic">Access Credentials</label>
                                <div className="space-y-4">
                                    <div className="relative group/input">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="NEW PASSWORD"
                                            className="w-full bg-muted/40 border border-border rounded-[1.5rem] h-16 pl-16 pr-6 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-black tracking-widest placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                    <div className="relative group/input">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="CONFIRM SECRECY"
                                            className="w-full bg-muted/40 border border-border rounded-[1.5rem] h-16 pl-16 pr-6 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-black tracking-widest placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isProcessing}
                                className="h-20 rounded-[1.5rem] bg-primary text-white text-[11px] font-black italic uppercase tracking-[0.25em] shadow-2xl shadow-primary/20 group hover:scale-[1.02] transition-all relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isProcessing ? "INITIALIZING..." : "SYNCHRONIZE ACCOUNT"}
                                    {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                                </div>
                            </Button>
                        </form>

                        <div className="pt-8 border-t border-border/50 w-full text-center">
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-30 italic italic">SmartHub Enterprise • Security Stage 02</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
