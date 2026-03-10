"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-store"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { setAuth } = useAuth()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return toast.error("Please fill in all fields")

        setLoading(true)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Identity verified successfully")
                setAuth(data.user)
                router.push("/")
            } else {
                toast.error(data.error || "Authentication failed")
            }
        } catch (error) {
            toast.error("Network error during login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border border-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Secure Access</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black font-outfit uppercase tracking-tighter italic leading-none">
                            WELCOME<br />BACK.
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground mt-2">
                            Access your synchronized devices, carts, and preferences.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">EMAIL ADDRESS</label>
                            <input
                                type="email"
                                placeholder="neo@matrix.com"
                                className="h-12 border border-border bg-muted/30 focus:bg-muted/50 transition-colors rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">PASSWORD</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="h-12 border border-border bg-muted/30 focus:bg-muted/50 transition-colors rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-14 mt-4 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black italic tracking-widest uppercase text-xs shadow-xl shadow-primary/20 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    AUTHENTICATE
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="flex items-center justify-center mt-6 pt-6 border-t border-border">
                        <p className="text-xs font-bold text-muted-foreground">
                            NEW USER?{" "}
                            <Link href="/register" className="text-primary hover:underline italic">
                                INITIALIZE PROFILE
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
