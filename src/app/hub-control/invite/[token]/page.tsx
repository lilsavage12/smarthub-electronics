"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Smartphone, Zap, ShieldCheck, Mail, Lock, ArrowRight, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore"

export default function AdminInvite() {
    const { token } = useParams()
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
    const [inviteDoc, setInviteDoc] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        validateToken()
    }, [token])

    const validateToken = async () => {
        if (!token) return

        try {
            const q = query(collection(db, "invites"), where("token", "==", token), where("status", "==", "PENDING"))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const invite = querySnapshot.docs[0]
                setInviteDoc(invite)
                setEmail(invite.data().email)
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
            toast.error("Protocol Error: Passwords do not match")
            return
        }

        if (password.length < 8) {
            toast.error("Protocol Error: Security key too weak (min 8 chars)")
            return
        }

        setIsProcessing(true)

        try {
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // 2. Create User Doc with ADMIN role
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                role: "ADMIN",
                createdAt: new Date()
            })

            // 3. Update Invite Status
            await updateDoc(doc(db, "invites", inviteDoc.id), {
                status: "ACCEPTED",
                acceptedAt: new Date(),
                userId: user.uid
            })

            toast.success("Identity Verified. Vault Access Initialized.", {
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
            toast.error(error.message || "Registration Protocol Failed")
            setIsProcessing(false)
        }
    }

    if (isValidToken === null) {
        return <div className="min-h-screen bg-[#050507] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <ShieldCheck className="w-12 h-12 text-primary opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Authenticating Token...</span>
            </div>
        </div>
    }

    if (isValidToken === false) {
        return <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 text-center flex flex-col gap-6 max-w-lg">
                <Zap className="w-16 h-16 text-red-500 mx-auto" />
                <h1 className="text-3xl font-black font-outfit uppercase italic tracking-tighter">Token <span className="text-red-500 italic">Invalid</span></h1>
                <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed tracking-widest">This security token has expired, been burned, or has already been used to initialize an identity.</p>
                <Button variant="outline" className="h-14 rounded-2xl border-red-500/20 text-red-500 font-bold uppercase" onClick={() => router.push("/")}>Return to Surface</Button>
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] opacity-30" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-background/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                            <UserPlus className="w-10 h-10 text-primary" />
                        </div>

                        <div className="text-center flex flex-col gap-2">
                            <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter italic">Identity <span className="text-primary italic">Initialization</span></h1>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Vault Officer Onboarding Pulse</p>
                        </div>

                        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Authorized Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none opacity-50 text-xs font-bold uppercase tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Master Security Key</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-center tracking-[0.5em] font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-4">Confirm Security Key</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-center tracking-[0.5em] font-bold"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isProcessing}
                                variant="premium"
                                className="h-16 rounded-2xl text-xs font-black italic tracking-[0.2em] shadow-xl group"
                            >
                                {isProcessing ? "INITIALIZING..." : "VERIFY & ENTER HUB"}
                                {!isProcessing && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>

                        <div className="pt-4 border-t border-white/5 w-full text-center">
                            <p className="text-[9px] text-muted-foreground uppercase font-medium tracking-widest opacity-40">System: SH-Vault-Core-v4.2.0 • Status: Protocol Phase 2</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
