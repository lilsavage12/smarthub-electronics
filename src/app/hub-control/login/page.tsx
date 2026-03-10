"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Smartphone, Zap, ShieldCheck, Lock, ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

export default function AdminLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsAuthenticating(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                // Store user info in localStorage for simple session management
                localStorage.setItem("sh_admin_user", JSON.stringify(data.user))

                toast.success("Success. Opening Dashboard...", {
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
            } else {
                throw new Error(data.error || "Access Denied")
            }
        } catch (error: any) {
            console.error(error)

            // EMERGENCY BYPASS: If it's the master admin and something failed, we might want to allow setup
            if (email.toLowerCase() === "admin@smarthub.com") {
                toast.error("Login failed. Try setting up the admin account below.", {
                    style: { background: '#1A0000', color: '#FF5555' }
                });
            } else {
                toast.error(error.message || "Invalid Credentials", {
                    duration: 6000,
                    style: {
                        background: '#1A0000',
                        color: '#FF5555',
                        border: '1px solid #440000',
                        fontSize: '11px',
                        fontWeight: '900',
                    }
                })
            }
            setIsAuthenticating(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm z-10"
            >
                <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden group transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>

                        <div className="text-center flex flex-col gap-1.5">
                            <h1 className="text-2xl font-black font-outfit uppercase tracking-tighter italic text-foreground">Admin <span className="text-primary italic">Login</span></h1>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sign in to your dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-3">Email Address</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@smarthub.com"
                                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-3">Password</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isAuthenticating}
                                variant="premium"
                                className="h-12 rounded-xl text-[10px] font-black italic tracking-[0.2em] shadow-xl group"
                            >
                                {isAuthenticating ? "SIGNING IN..." : "SIGN IN"}
                                {!isAuthenticating && <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                            </Button>

                            <div className="flex flex-col gap-2 pt-5 border-t border-white/5 mt-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30 text-center">First Time Setup</span>
                                <button
                                    type="button"
                                    disabled={isAuthenticating}
                                    onClick={async () => {
                                        setIsAuthenticating(true);
                                        const loadingToast = toast.loading("Setting up admin...");
                                        try {
                                            const res = await fetch("/api/setup-admin");
                                            const data = await res.json();

                                            if (res.ok && data.success) {
                                                toast.success("Admin Account Initialized", { duration: 5000 });
                                            } else {
                                                throw new Error(data.error || "Setup failed");
                                            }
                                        } catch (e: any) {
                                            toast.error(e.message || "Connection Error", { id: loadingToast });
                                        } finally {
                                            setIsAuthenticating(false);
                                            toast.dismiss(loadingToast);
                                        }
                                    }}
                                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-all text-center border border-primary/20 py-3 rounded-xl bg-primary/10 hover:bg-primary shadow-lg shadow-primary/5"
                                >
                                    {isAuthenticating ? "SETTING UP..." : "Setup Master Admin"}
                                </button>
                            </div>
                        </form>

                        <div className="pt-3 border-t border-white/5 w-full text-center">
                            <p className="text-[8px] text-muted-foreground uppercase font-medium tracking-widest opacity-40">SmartHub Admin</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-5 opacity-20">
                    <Smartphone className="w-3.5 h-3.5 text-white" />
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
            </motion.div>
        </div>
    )
}
