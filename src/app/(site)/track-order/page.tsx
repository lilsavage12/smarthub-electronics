"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Truck, Package, CheckCircle2,
    Clock, MapPin, Phone, MessageSquare,
    ArrowRight, ChevronRight, ShieldCheck,
    AlertCircle, Activity, Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [trackData, setTrackData] = useState<any>(null)

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderNumber) return

        setIsSearching(true)
        // Simulate API call
        setTimeout(() => {
            setTrackData({
                orderNumber: orderNumber.toUpperCase(),
                status: "In Transit",
                statusDesc: "Handed over to G4S Logistics for Nationwide Dispatch.",
                lastLocation: "Nairobi Central Hub",
                eta: "Tomorrow, by 4:00 PM",
                timeline: [
                    { status: "Delivered", date: "--", done: false },
                    { status: "In Transit", date: "March 07, 10:45 AM", done: true, current: true },
                    { status: "Quality Check", date: "March 06, 04:20 PM", done: true },
                    { status: "Order Received", date: "March 06, 12:15 PM", done: true },
                ],
                customer: {
                    name: "John Doe",
                    phone: "+254 700 *** 123",
                    address: "Biashara Street, Nairobi"
                }
            })
            setIsSearching(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-4xl mx-auto flex flex-col gap-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"
                    >
                        Real-Time Satellite tracking
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter italic">Track Your <span className="text-primary italic">Hardware</span></h1>
                    <p className="text-muted-foreground max-w-xl text-lg font-medium leading-relaxed uppercase selection:bg-primary selection:text-white">
                        Enter your unique SmartHub order identifier below to triangulate your shipment's current position within the G4S network.
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="p-2 rounded-[2.5rem] bg-card border-border shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2 relative z-10">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="ENTER ORDER NUMBER (E.G. SH-6721-X)"
                                className="w-full h-16 bg-transparent border-none outline-none pl-16 pr-6 text-sm font-black uppercase tracking-widest placeholder:text-muted-foreground/30"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSearching}
                            variant="premium"
                            className="h-16 px-12 rounded-[2rem] text-xs font-black italic tracking-widest group"
                        >
                            {isSearching ? "TRIANGULATING..." : "SEARCH PROTOCOL"}
                            {!isSearching && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>
                </Card>

                <AnimatePresence mode="wait">
                    {trackData ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                        >
                            {/* Main Tracking Info */}
                            <Card className="lg:col-span-3 rounded-[2rem] p-8 border-border bg-card flex flex-col gap-10 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black italic uppercase text-primary tracking-widest">ORDER IDENTIFIED</span>
                                        <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter italic">{trackData.orderNumber}</h3>
                                    </div>
                                    <div className="flex items-center gap-3 bg-muted px-4 py-3 rounded-2xl border border-border">
                                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-foreground leading-none">{trackData.status}</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Live Status</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-8 relative z-10">
                                    {trackData.timeline.map((step: any, i: number) => (
                                        <div key={i} className="flex gap-6 items-start group">
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    "h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                                    step.current ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-125" :
                                                        step.done ? "bg-emerald-500 border-emerald-500" : "bg-muted border-border"
                                                )}>
                                                    {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-border" />}
                                                </div>
                                                {i !== trackData.timeline.length - 1 && (
                                                    <div className={cn("w-0.5 h-12 my-2 transition-all duration-700", step.done ? "bg-emerald-500" : "bg-border")} />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 pt-0.5">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                    step.current ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground opacity-30"
                                                )}>
                                                    {step.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{step.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Delivery Details */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <Card className="p-8 rounded-[2rem] border-border bg-card flex flex-col gap-6 shadow-sm">
                                    <h4 className="text-[10px] font-black italic uppercase tracking-widest text-primary flex items-center gap-2">
                                        <MapPin size={14} />
                                        Destination Intel
                                    </h4>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40">Recipient</span>
                                            <span className="text-sm font-black italic uppercase">{trackData.customer.name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40">Dispatch Hub</span>
                                            <span className="text-sm font-black italic uppercase">{trackData.lastLocation}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40">ETA Schedule</span>
                                            <span className="text-sm font-black italic uppercase text-primary">{trackData.eta}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2">
                                        <MessageSquare size={14} />
                                        CONTACT DISPATCHER
                                    </Button>
                                </Card>

                                <Card className="p-8 rounded-[2rem] border-border bg-primary/5 flex flex-col gap-4 shadow-sm border-dashed">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="text-primary" size={16} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Buyer Protection</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wider italic">
                                        Your order is insured for its full market value. Do not accept the package if the secure seals are broken.
                                    </p>
                                </Card>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {[
                                { icon: <Truck className="text-primary" />, title: "Nationwide Support", desc: "Covers all 47 counties including remote outposts." },
                                { icon: <Globe className="text-primary" />, title: "Satellite Link", desc: "Direct GPS integration with G4S logistics fleet." },
                                { icon: <Activity className="text-primary" />, title: "Live Updates", desc: "Instant SMS notifications on every status shift." }
                            ].map((feat, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-muted/20 border border-border/50 flex flex-col gap-4 text-center items-center">
                                    <div className="p-4 bg-background rounded-2xl shadow-sm border border-border">
                                        {feat.icon}
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase italic tracking-widest">{feat.title}</h4>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 leading-relaxed italic">{feat.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
