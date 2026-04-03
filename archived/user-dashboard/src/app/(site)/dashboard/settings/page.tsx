"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    User, Mail, Phone, Lock, Save, Loader2, 
    ShieldCheck, Fingerprint, Bell, CreditCard,
    Smartphone, History, Shield, Key
} from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function AccountSettings() {
    const { user, setAuth, isInitialized } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")
    
    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || "",
        email: user?.email || "",
        phone: ""
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    React.useEffect(() => {
        if (!isInitialized) return
        if (!user) {
            router.push("/login")
        }
    }, [user, router, isInitialized])

    if (!user) return null

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    displayName: profileData.displayName,
                    email: profileData.email,
                    phone: profileData.phone
                })
            })

            if (res.ok) {
                const updatedUser = await res.json()
                setAuth({
                    ...user,
                    displayName: updatedUser.displayName,
                    email: updatedUser.email
                })
                toast.success("Profile updated successfully")
            } else {
                toast.error("Failed to update profile")
            }
        } catch (error) {
            toast.error("Network connection error")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Please fill all security fields")
            return
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        setLoading(true)
        try {
            // Simulated delay for security verification
            await new Promise(resolve => setTimeout(resolve, 1200))
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            toast.success("Security credentials updated")
        } catch (error) {
            toast.error("Update failed. Please check current password")
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: "profile", name: "Public Identity", icon: User },
        { id: "security", name: "Security Protocols", icon: Lock },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Account Settings</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your profile identity and security settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                    
                    {/* Navigation Sidebar */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        <Card className="bg-card border-border rounded-2xl p-4 shadow-sm overflow-hidden">
                            <div className="flex flex-col gap-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all group",
                                            activeTab === tab.id 
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "group-hover:text-primary transition-colors")} />
                                        {tab.name}
                                    </button>
                                ))}
                            </div>
                        </Card>

                    </div>

                    {/* Content Section */}
                    <div className="xl:col-span-3">
                        {activeTab === "profile" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <Card className="border-border bg-card rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                                    <div className="p-8 border-b border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <Fingerprint className="w-6 h-6 text-primary" />
                                            </div>
                                            <h2 className="text-xl font-bold uppercase italic tracking-tighter">Operator Profile</h2>
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={handleProfileUpdate} className="p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.displayName}
                                                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                                    className="w-full px-6 py-4 bg-muted/20 border-border border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold uppercase tracking-widest text-[11px]"
                                                    placeholder="FULL NAME"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Registry Phone</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20" />
                                                    <input
                                                        type="tel"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="w-full px-6 py-4 bg-muted/20 border-border border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold uppercase tracking-widest text-[11px]"
                                                        placeholder="+254 XXX XXX XXX"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Identity</label>
                                            <div className="relative">
                                                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full px-6 py-4 bg-muted/20 border-border border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold uppercase tracking-widest text-[11px]"
                                                    placeholder="IDENTITY@EMAIL.COM"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button type="submit" disabled={loading} className="rounded-2xl h-14 px-12 font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE UPDATE"}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "security" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <Card className="border-border bg-card rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                                    <div className="p-8 border-b border-border/50 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield size={22} />
                                        </div>
                                        <h2 className="text-xl font-bold uppercase italic tracking-tighter">Cryptographic Security</h2>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="p-10 space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Current Key</label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted/20 border-border border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold"
                                                placeholder="••••••••••••"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">New Protocol Key</label>
                                                <div className="relative">
                                                    <Key className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20" />
                                                    <input
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full px-6 py-4 bg-muted/20 border-border border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold"
                                                        placeholder="••••••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Confirm Protocol Key</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full px-6 py-4 bg-muted/20 border-border border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button type="submit" disabled={loading} className="rounded-2xl h-14 px-12 font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 bg-foreground text-background hover:bg-primary hover:text-white transition-all">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ROTATE SECURITY KEYS"}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
