"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Zap, Package, ShoppingBag, Settings, User,
    ChevronRight, CreditCard, ShieldCheck, LogOut,
    Truck, MapPin, Smartphone, Star, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function UserDashboard() {
    const { user, setAuth } = useAuth()
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }

        const fetchUserOrders = async () => {
            try {
                const res = await fetch("/api/orders?userId=" + user.id)
                if (res.ok) setOrders(await res.json())
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUserOrders()
    }, [user, router])

    const handleLogout = () => {
        setAuth(null)
        toast.success("Signed out successfully")
        router.push("/")
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background pt-10 pb-20 px-6">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">User Ecosystem</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black font-outfit uppercase tracking-tighter italic leading-none text-foreground">
                            MASTER <span className="text-primary italic">HUB.</span>
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground mt-2 max-w-xl">
                            Welcome back, {user.displayName || 'Operative'}. Your synchronized environment is active across all devices.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{user.email}</span>
                            <span className="text-[10px] font-bold text-primary italic uppercase tracking-widest">Protocol ID: {user.id.slice(-8)}</span>
                        </div>
                        <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block" />
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="h-14 rounded-2xl px-6 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="flex flex-col gap-1 bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-4 overflow-hidden shadow-2xl">
                            {[
                                { name: 'Overview', icon: <Smartphone />, active: true },
                                { name: 'My Orders', icon: <Package /> },
                                { name: 'Tracking', icon: <Truck /> },
                                { name: 'Addresses', icon: <MapPin /> },
                                { name: 'Payment Methods', icon: <CreditCard /> },
                                { name: 'Preferences', icon: <Settings /> }
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    className={`flex items-center justify-between w-full h-14 px-6 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${item.active ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>

                        <div className="bg-gradient-to-br from-primary to-primary/60 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col gap-6">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 italic">Support Status</span>
                                <h3 className="text-2xl font-black font-outfit uppercase leading-none italic">VIP ELITE <br />PRIORITY</h3>
                                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest opacity-80">You have unlimited access to our 24/7 technical concierge.</p>
                                <Button className="h-12 bg-white text-primary hover:bg-white/90 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-xl">Connect Now</Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-9 flex flex-col gap-10">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Active Orders', value: orders.length, icon: <Package />, color: 'text-primary' },
                                { label: 'Reward Points', value: '2,450', icon: <Star />, color: 'text-emerald-500' },
                                { label: 'Recent Views', value: '14', icon: <Clock />, color: 'text-blue-500' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-card/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] flex flex-col gap-4 shadow-xl">
                                    <div className={`${stat.color} bg-current/10 p-3 w-fit rounded-xl border border-current/10`}>
                                        {React.cloneElement(stat.icon as React.ReactElement, { size: 20 })}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{stat.label}</span>
                                        <span className="text-3xl font-black font-outfit text-foreground mt-1">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter italic text-foreground leading-none">Recent <span className="text-primary italic">Movement</span></h2>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Historical transaction registry</span>
                                </div>
                                <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">View Full Log</Button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center py-20 gap-4 opacity-30">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Querying Cloud Registry...</span>
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {orders.slice(0, 3).map((order) => (
                                        <div key={order.id} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
                                            <div className="flex items-center gap-6">
                                                <div className="bg-background rounded-xl p-4 border border-white/5 group-hover:border-primary/30 transition-colors shadow-inner">
                                                    <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest italic leading-none mb-1">Order {order.id.slice(-8)}</span>
                                                    <span className="text-sm font-bold text-foreground">{order.items?.length || 0} Synchronized Components</span>
                                                    <span className="text-[9px] text-muted-foreground uppercase font-medium mt-1 tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Status</span>
                                                    <span className="text-[11px] font-black italic uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{order.status}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Total Value</span>
                                                    <span className="text-xl font-black font-outfit text-foreground italic">${order.totalAmount}</span>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                                                    <ChevronRight size={20} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-20 px-10 text-center gap-6 border-2 border-dashed border-white/5 rounded-3xl">
                                    <div className="p-6 rounded-3xl bg-white/[0.03] text-muted-foreground opacity-30">
                                        <Package size={40} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-foreground leading-none">No Components found</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-relaxed">Your acquisition history is currently empty in this ecosystem.</p>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/products')}
                                        className="h-12 bg-primary hover:bg-primary/90 rounded-xl px-10 text-[10px] font-black uppercase tracking-widest italic shadow-xl"
                                    >
                                        Explore Registry
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Loyalty Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl group">
                                <div className="flex items-center justify-between">
                                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                        <ShieldCheck className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.3em] animate-pulse italic">Active Protection</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter italic text-foreground leading-none">Device <span className="text-blue-500 italic">Insurance.</span></h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-relaxed mt-2">Extended warranty active for 3 synchronized devices in your ecosystem.</p>
                                </div>
                                <Button variant="outline" className="h-12 border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all group-hover:border-blue-500">Manage Policies</Button>
                            </div>

                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-2xl group">
                                <div className="flex items-center justify-between">
                                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                                        <Star className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.3em] italic">Loyalty Level 04</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter italic text-foreground leading-none">Member <span className="text-primary italic">Rewards.</span></h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-relaxed mt-2">You are 550 points away from unlocking the next technological tier.</p>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[70%] bg-primary shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
