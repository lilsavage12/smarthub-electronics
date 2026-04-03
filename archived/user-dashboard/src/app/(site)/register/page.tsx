/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User authentication and related APIs have been detached.
 */
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { UserPlus, ArrowRight, Loader2, Mail, Lock, User, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-store"
import { useCart } from "@/lib/cart-store"
import { useWishlist } from "@/lib/wishlist-store"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { setAuth } = useAuth()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password || !displayName) return toast.error("Please provide all required synchronization details")

        setLoading(true)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, displayName })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("ACCOUNT CREATED SUCCESSFULLY", {
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '10px',
                        fontWeight: 'black',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }
                })
                setAuth(data.user)
                router.push("/")
            } else {
                toast.error(data.error || "Registration failed. Please try again.")
            }
        } catch (error) {
            toast.error("Connection error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-20 px-6 bg-background relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 shadow-inner">
                                <UserPlus className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter italic leading-none text-foreground">
                                    Sign <span className="text-primary italic">Up</span>
                                </h1>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2 opacity-60">Initialize your global profile</p>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Identity Name</label>
                                <div className="relative group/input">
                                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Display Name"
                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-muted-foreground/30"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Email Terminal</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="your@email.com"
                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-muted-foreground/30"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Master Passkey</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-muted-foreground/30"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-16 mt-4 bg-primary text-white hover:bg-primary/90 rounded-[1.5rem] font-black italic tracking-[0.2em] uppercase text-[10px] shadow-2xl shadow-primary/20 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        SIGN UP NOW
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="flex flex-col items-center gap-6 mt-4">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                RETURNING?{" "}
                                <Link href="/login" className="text-primary hover:text-white transition-colors italic ml-1">
                                    SIGN IN HERE
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

