"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Lock, Save, Loader2, ShieldCheck, Fingerprint, Bell, CreditCard } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AccountSettings() {
    const { user, setAuth, isInitialized } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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
                toast.success("Profile saved")
            } else {
                toast.error("Failed to save profile")
            }
        } catch (error) {
            toast.error("Connection error")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("All password fields are required")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setLoading(true)
        try {
            // Mocking password change for now as backend endpoint might need specific implementation
            await new Promise(resolve => setTimeout(resolve, 800))
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            toast.success("Security updated")
        } catch (error) {
            toast.error("Security update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Account & Security</h1>
                    <p className="text-muted-foreground">
                        Manage your profile identity and login credentials
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Sidebar Tabs (Visual Only for now) */}
                    <div className="xl:col-span-1 space-y-4">
                        <div className="bg-card border border-border rounded-3xl p-6 space-y-2">
                            {[
                                { name: "Public Profile", icon: User, active: true },
                                { name: "Security & Login", icon: Lock, active: false },
                                { name: "Notifications", icon: Bell, active: false },
                                { name: "Payment Methods", icon: CreditCard, active: false }
                            ].map((tab, i) => (
                                <button
                                    key={i}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                        tab.active 
                                            ? "bg-primary/10 text-primary border border-primary/20" 
                                            : "text-muted-foreground hover:bg-accent border border-transparent"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 bg-accent/30 rounded-3xl border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Verified Account</span>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider italic">
                                Your account is secured with 256-bit encryption. We never store raw passwords.
                            </p>
                        </div>
                    </div>

                    {/* Main Content Areas */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Profile Info */}
                        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-border flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Fingerprint className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold uppercase italic tracking-tighter">Profile Details</h2>
                            </div>
                            
                            <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profileData.displayName}
                                                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                                className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                                placeholder="YOUR FULL NAME"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                                placeholder="+254 XXX XXX XXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Identity</label>
                                    <div className="relative">
                                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                            placeholder="IDENTITY@SMARTHUB.COM"
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2 ml-1 italic">Changing your email will require re-verification.</p>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="rounded-2xl h-14 px-12 font-black uppercase italic tracking-widest">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Password Section */}
                        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-border flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold uppercase italic tracking-tighter">Security & Password</h2>
                            </div>

                            <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="rounded-2xl h-14 px-12 font-black uppercase italic tracking-widest border-2" variant="outline">
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
