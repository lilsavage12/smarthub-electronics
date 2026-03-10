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
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-red-500/10 rounded-full blur-[100px] opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] z-10"
            >
                <div className="bg-card/40 backdrop-blur-3xl border border-red-500/20 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-10" />

                    <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className="bg-red-500/10 p-5 rounded-[2rem] border border-red-500/20 animate-pulse">
                            <ShieldCheck className="w-12 h-12 text-red-500" />
                        </div>

                        <div className="text-center flex flex-col gap-3">
                            <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter italic text-foreground leading-none">Access <span className="text-red-500 italic underline decoration-4 underline-offset-8">Restricted</span></h1>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-70">Security Protocol Alpha-9 Active</p>
                        </div>

                        <div className="w-full p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col gap-5 text-center">
                            <div className="flex items-center justify-center gap-3 text-red-500 mb-2">
                                <Lock size={20} />
                                <span className="text-xs font-black uppercase tracking-widest italic">Hub Lockout in Effect</span>
                            </div>
                            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest">
                                The SmartHub command center is undergoing periodic encryption rotation and database maintenance.
                                <br /><br />
                                <span className="text-white">Admin access has been temporarily revoked by system policy.</span>
                            </p>
                        </div>

                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

                        <div className="flex flex-col gap-2 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] opacity-40">Please contact the lead systems architect</p>
                            <span className="text-[8px] font-bold text-red-500/50 uppercase tracking-widest">Protocol ID: MAINTENANCE_MODE_ON</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale">
                    <Smartphone className="w-4 h-4 text-white" />
                    <Zap className="w-4 h-4 text-white" />
                    <ShieldCheck className="w-4 h-4 text-white" />
                </div>
            </motion.div>
        </div>
    )
}
