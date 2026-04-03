"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Users, TrendingUp, ShieldCheck, Zap,
    Globe, Smartphone, CreditCard, BarChart3,
    ArrowRight, ChevronRight, CheckCircle2,
    Layers, Rocket, DollarSign, Handshake,
    Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col gap-20 py-20 overflow-hidden">
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-primary/10 w-fit px-4 py-1.5 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        THE VENDOR ECOSYSTEM
                    </motion.div>
                    <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic leading-[0.85]">
                        Scale <span className="text-primary italic">Faster.</span><br />
                        Sell <span className="opacity-40 italic">Smarter.</span>
                    </h1>
                    <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-xl italic uppercase">
                        Join East Africa's most advanced digital hardware marketplace. Connect your inventory to thousands of verified buyers through our AI-driven logistics network.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="premium" className="h-16 px-10 rounded-2xl text-[11px] font-black italic tracking-widest group">
                            APPLY TO SELL
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="outline" className="h-16 px-10 rounded-2xl text-[11px] font-black italic tracking-widest border-2">
                            VIEW FEE CONSOLE
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 grid grid-cols-2 gap-4"
                    >
                        {[
                            { label: "Active Vendors", value: "850+", icon: <Users size={24} /> },
                            { label: "Monthly Reach", value: "1.2M", icon: <Globe size={24} /> },
                            { label: "Order Velocity", value: "12/min", icon: <TrendingUp size={24} /> },
                            { label: "Partner Trust", value: "99.8%", icon: <ShieldCheck size={24} /> }
                        ].map((stat, i) => (
                            <Card key={i} className="p-8 rounded-[2rem] border-border bg-card flex flex-col gap-4 shadow-2xl hover:translate-y-[-8px] transition-transform duration-500">
                                <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary">
                                    {stat.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black italic tracking-tighter text-foreground">{stat.value}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1">{stat.label}</span>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Why Join Section */}
            <div className="bg-muted/30 py-32 border-y border-border/50">
                <div className="max-w-6xl mx-auto px-6 flex flex-col gap-16">
                    <div className="flex flex-col items-center text-center gap-4">
                        <span className="text-[10px] font-black italic uppercase text-primary tracking-widest">WHY SMARTHUB?</span>
                        <h2 className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter italic">Engineered for <span className="text-primary italic">Maximum Revenue</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Instant Payouts",
                                desc: "No more waiting weeks for your funds. Receive payments via M-PESA or Bank Transfer within 24 hours of successful delivery.",
                                icon: <DollarSign size={32} className="text-emerald-500" />
                            },
                            {
                                title: "Smart Logistics",
                                desc: "Leverage our integrated G4S partnership. We handle the pickup, insurance, and last-mile delivery across all 47 counties.",
                                icon: <Truck size={32} className="text-blue-500" />
                            },
                            {
                                title: "Seller Terminal",
                                desc: "Manage your inventory, track conversions, and analyze market trends with our state-of-the-art administrative dashboard.",
                                icon: <BarChart3 size={32} className="text-primary" />
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-6 items-center text-center group">
                                <div className="p-8 bg-background rounded-[2.5rem] border border-border shadow-sm group-hover:shadow-xl group-hover:border-primary/20 transition-all duration-500 group-hover:translate-y-[-10px]">
                                    {item.icon}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xl font-black italic uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider leading-relaxed opacity-70 italic">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Partnership Tiers */}
            <div className="max-w-6xl mx-auto px-6 flex flex-col gap-12">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Select Your <span className="text-primary italic">Trajectory</span></h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Choose the membership plan that fits your business.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        {
                            tier: "Lite Vendor",
                            price: "FREE",
                            features: ["Listed in Marketplace", "Standard G4S Delivery", "Weekly Payouts", "3.5% Transaction Fee"],
                            cta: "GET STARTED"
                        },
                        {
                            tier: "Certified Hub",
                            price: "$49/mo",
                            features: ["Premium Verified Badge", "Express Delivery Access", "Instant Daily Payouts", "2.0% Transaction Fee", "AI Ad Credit ($10)"],
                            cta: "GO PREMIUM",
                            featured: true
                        }
                    ].map((plan, i) => (
                        <Card key={i} className={cn(
                            "p-10 rounded-[2.5rem] flex flex-col gap-10 border-2 transition-all duration-500 relative overflow-hidden",
                            plan.featured ? "bg-slate-950 text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]" : "bg-card border-border hover:border-primary/20"
                        )}>
                            {plan.featured && <div className="absolute top-6 right-6 px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase italic tracking-widest text-white">RECOMMENDED</div>}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">{plan.tier}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black font-outfit tracking-tighter italic">{plan.price}</span>
                                    {plan.price !== "FREE" && <span className="text-xs opacity-40 italic">/ BILLING CYCLE</span>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic opacity-80">{feat}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant={plan.featured ? "premium" : "outline"} className="h-16 w-full rounded-2xl text-[11px] font-black italic tracking-widest">
                                {plan.cta}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <Card className="p-16 rounded-[3rem] bg-slate-900 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <Handshake className="text-primary" size={64} />
                        <h2 className="text-4xl md:text-5xl font-black font-outfit text-white uppercase tracking-tighter italic">Ready to <span className="text-primary italic">Connect?</span></h2>
                        <p className="text-slate-400 max-w-lg font-medium uppercase tracking-[0.05em] text-sm leading-relaxed italic">
                            Getting started takes less than 5 minutes. Join the SmartHub community today and grow your business.
                        </p>
                        <Button variant="premium" className="h-20 px-16 rounded-3xl text-lg font-black italic tracking-widest shadow-2xl shadow-primary/20">
                            JOIN NOW
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
