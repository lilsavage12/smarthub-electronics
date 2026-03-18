
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Truck, Package, CheckCircle2,
    Clock, MapPin, Phone, MessageSquare,
    ArrowRight, ChevronRight, ShieldCheck,
    AlertCircle, Activity, Globe, ExternalLink,
    Calendar, Box, ShoppingCart, CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

const TRACKING_STAGES = [
    { key: 'Order Placed', label: 'Order Placed', icon: <ShoppingCart size={16} />, desc: 'Registry initialized' },
    { key: 'Processing', label: 'Processing', icon: <Clock size={16} />, desc: 'Hardware prep in progress' },
    { key: 'Payment Confirmed', label: 'Payment Confirmed', icon: <CreditCard size={16} />, desc: 'Financial clearance' },
    { key: 'Shipped', label: 'Shipped', icon: <Truck size={16} />, desc: 'Asset in transit' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: <Box size={16} />, desc: 'Final mile dispatch' },
    { key: 'Delivered', label: 'Delivered', icon: <CheckCircle2 size={16} />, desc: 'Operation complete' }
]

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [trackData, setTrackData] = useState<any>(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Handle initial track via URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const queryOrder = params.get('orderNumber') || params.get('id')
        if (queryOrder) {
            setOrderNumber(queryOrder.toUpperCase())
            handleTrack(null, queryOrder)
        }
        setIsInitialLoad(false)
    }, [])

    // Real-time subscription
    useEffect(() => {
        if (!trackData?.id) return

        const channel = supabase
            .channel(`order-tracking-${trackData.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Order',
                    filter: `id=eq.${trackData.id}`
                },
                (payload) => {
                    console.log('Order Change Detected:', payload.new)
                    // Refresh data when update occurs
                    handleTrack(null, trackData.orderNumber)
                    
                    // In-app notification simulation
                    toast.success(`Order #${trackData.orderNumber} updated to ${payload.new.status}`, {
                        icon: '⚡',
                        duration: 6000,
                        position: 'top-right',
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [trackData?.id])

    const handleTrack = async (e: React.FormEvent | null, overideNumber?: string) => {
        if (e) e.preventDefault()
        const num = overideNumber || orderNumber
        if (!num) return

        setIsSearching(true)
        try {
            const res = await fetch(`/api/track/${num.toUpperCase()}`)
            const data = await res.json()

            if (res.ok) {
                setTrackData(data)
            } else {
                const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || "Order not found")
                toast.error(errorMessage)
                setTrackData(null)
            }
        } catch (error) {
            toast.error("Network error fetching tracking.")
        } finally {
            setIsSearching(false)
        }
    }

    const getStageStatus = (stage: string) => {
        if (!trackData) return 'pending'
        
        const statusMap: Record<string, number> = {
            'ORDER PLACED': 0,
            'PROCESSING': 1,
            'PAYMENT CONFIRMED': 2,
            'SHIPPED': 3,
            'OUT FOR DELIVERY': 4,
            'DELIVERED': 5,
            'COMPLETED': 5
        }

        const currentIdx = statusMap[trackData.status.toUpperCase()] ?? 0
        const stageIdx = TRACKING_STAGES.findIndex(s => s.key === stage)

        if (stage === 'Order Placed') return 'done'

        // Only auto-tick Payment Confirmed if both current status is at least that stage AND it's paid
        // OR if the status has moved beyond it
        if (stage === 'Payment Confirmed') {
            if (currentIdx > 2) return 'done'
            if (currentIdx === 2 && trackData.paymentStatus === 'Paid') return 'done'
            return 'pending'
        }

        if (stageIdx <= currentIdx) return 'done'
        return 'pending'
    }

    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary/10 px-6 py-2 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
                    >
                        Strategic Asset Tracking v2.0
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic leading-none">
                        Track Your <span className="text-primary italic">Hardware</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl text-xs font-bold uppercase tracking-widest leading-relaxed opacity-60">
                        Enter your secure order reference to monitor hardware lifecycle in real-time.
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="p-2 rounded-[2.5rem] bg-card border-border shadow-2xl relative overflow-hidden group max-w-2xl mx-auto w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <form onSubmit={(e) => handleTrack(e)} className="flex flex-col md:flex-row gap-2 relative z-10">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="ENTER ORDER REFERENCE (E.G. SH-1234)"
                                className="w-full h-16 bg-transparent border-none outline-none pl-16 pr-6 text-sm font-black uppercase tracking-widest placeholder:text-muted-foreground/20"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSearching}
                            className="h-16 px-12 rounded-[2rem] text-xs font-black italic tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
                        >
                            {isSearching ? "SYNCING..." : "TRACK ASSET"}
                            {!isSearching && <ArrowRight className="ml-2 w-4 h-4" />}
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
                            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                        >
                            {/* Left Panel: Status Summary & Timeline */}
                            <div className="lg:col-span-8 flex flex-col gap-8">
                                {/* Status Card */}
                                <Card className="rounded-[3rem] p-10 border-border bg-card shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                                                                       <div className="flex flex-col gap-8 relative z-10 border-b border-border/50 pb-8 mb-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                        Live Monitoring
                                                    </Badge>
                                                    <span className="text-[10px] font-black italic uppercase text-primary tracking-widest">Manifest {trackData.orderNumber}</span>
                                                </div>
                                                <h3 className="text-4xl font-black font-outfit uppercase tracking-tighter italic">Logistics Status</h3>
                                            </div>
                                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-[2rem] border border-border group hover:border-primary/30 transition-colors">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Truck className="text-primary" size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-foreground leading-none">{trackData.status}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5 tracking-widest">Current Milestone</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Progress Bar */}
                                        {(() => {
                                            const statusMap: Record<string, number> = {
                                                'ORDER PLACED': 0,
                                                'PROCESSING': 1,
                                                'PAYMENT CONFIRMED': 2,
                                                'SHIPPED': 3,
                                                'OUT FOR DELIVERY': 4,
                                                'DELIVERED': 5,
                                                'COMPLETED': 5
                                            }
                                            const currentIdx = statusMap[trackData.status.toUpperCase()] ?? 0
                                            const progress = ((currentIdx + 1) / 6) * 100

                                            return (
                                                <div className="relative w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mt-4">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/80 to-primary/50"
                                                    />
                                                </div>
                                            )
                                        })()}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.1em]">Internal UID</span>
                                                <span className="text-xs font-black uppercase font-mono">#{trackData.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.1em]">Deployment Date</span>
                                                <span className="text-xs font-black uppercase">{new Date(trackData.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.1em]">Asset Valuation</span>
                                                <span className="text-xs font-black uppercase">${trackData.totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.1em]">Financial Status</span>
                                                <Badge variant="outline" className={cn(
                                                    "w-fit px-3 py-0.5 rounded-full text-[8px] font-black uppercase border",
                                                    trackData.paymentStatus === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    {trackData.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vertical Timeline */}
                                    <div className="flex flex-col gap-12 relative z-10 px-4">
                                        {TRACKING_STAGES.map((stage, i) => {
                                            const status = getStageStatus(stage.key)
                                            const isLast = i === TRACKING_STAGES.length - 1
                                            
                                            return (
                                                <div key={i} className="flex gap-10 group">
                                                    <div className="flex flex-col items-center">
                                                        <motion.div 
                                                            initial={{ scale: 0.8 }}
                                                            animate={{ 
                                                                scale: status === 'done' ? 1.05 : 0.8,
                                                                rotate: status === 'done' ? [0, 5, -5, 0] : 0
                                                            }}
                                                            transition={{ duration: 0.5 }}
                                                            className={cn(
                                                                "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-700",
                                                                status === 'done' 
                                                                    ? "bg-primary border-primary shadow-xl shadow-primary/20" 
                                                                    : "bg-muted/50 border-border grayscale opacity-30"
                                                            )}
                                                        >
                                                            {status === 'done' 
                                                                ? React.cloneElement(stage.icon as React.ReactElement<any>, { className: "text-white w-6 h-6" }) 
                                                                : React.cloneElement(stage.icon as React.ReactElement<any>, { className: "text-muted-foreground w-6 h-6" })
                                                            }
                                                        </motion.div>
                                                        {!isLast && (
                                                            <div className={cn(
                                                                "w-1 h-12 my-3 rounded-full transition-all duration-1000",
                                                                status === 'done' ? "bg-primary" : "bg-border opacity-20"
                                                            )} />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2 pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn(
                                                                "text-sm font-black uppercase italic tracking-widest transition-all duration-500",
                                                                status === 'done' ? "text-foreground" : "text-muted-foreground opacity-20"
                                                            )}>
                                                                {stage.label}
                                                            </span>
                                                            {status === 'done' && (
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase tracking-widest opacity-80",
                                                            status === 'done' ? "text-primary" : "text-muted-foreground opacity-20"
                                                        )}>
                                                            {stage.desc}
                                                        </span>
                                                        {status === 'done' && trackData.history?.find((h: any) => h.status === stage.key) && (
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                                    Logged: {new Date(trackData.history.find((h: any) => h.status === stage.key).timestamp).toLocaleString()}
                                                                </span>
                                                                {trackData.history.find((h: any) => h.status === stage.key).message && (
                                                                    <p className="text-[10px] font-medium text-foreground/70 italic border-l-2 border-primary/20 pl-3 py-1 mt-1">
                                                                        "{trackData.history.find((h: any) => h.status === stage.key).message}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>

                                {/* Delivery History Table */}
                                <Card className="rounded-[3rem] p-10 border-border bg-card shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-[10px] font-black uppercase italic tracking-widest text-primary flex items-center gap-2">
                                            <Activity size={14} />
                                            Transmission History
                                        </h4>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        {trackData.history && trackData.history.length > 0 ? (
                                            trackData.history.map((h: any, i: number) => (
                                                <div key={i} className="flex items-start gap-6 pb-6 border-b border-border last:border-none last:pb-0">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{h.status}</span>
                                                            <span className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(h.timestamp).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed">{h.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">No additional history found.</p>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Right Panel: Details & Support */}
                            <div className="lg:col-span-4 flex flex-col gap-8">
                                {/* Shipping Info */}
                                <Card className="p-10 rounded-[3rem] border-border bg-card flex flex-col gap-8 shadow-sm">
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <span className="text-[9px] font-black uppercase text-primary tracking-widest">ORDER INFORMATION</span>
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter">Delivery Details</h4>
                                    </div>

                                    <div className="space-y-8 relative z-10">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Customer Name</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                    <ShieldCheck className="text-emerald-500" size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black italic uppercase">{trackData.customerName}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Verified Identity</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Shipping Address</span>
                                            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-2xl border border-border/50">
                                                <MapPin className="text-primary mt-0.5 shrink-0" size={14} />
                                                <span className="text-xs font-bold text-muted-foreground leading-relaxed uppercase">{trackData.shippingAddress ? `${trackData.shippingAddress.addressLine1}, ${trackData.shippingAddress.city}, ${trackData.shippingAddress.postalCode}` : `${trackData.address}, ${trackData.city}`}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Shipping Carrier</span>
                                            <div className="flex items-center gap-3">
                                                <Globe className="text-muted-foreground" size={14} />
                                                <span className="text-xs font-black italic uppercase">{trackData.courier || 'SmartHub Logistics'}</span>
                                            </div>
                                        </div>

                                        {trackData.trackingNumber && (
                                            <div className="flex flex-col gap-3 p-6 bg-primary/5 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5 group/tracking">
                                                <span className="text-[9px] font-black uppercase text-primary tracking-widest">TRACKING ID</span>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black font-mono tracking-wider">{trackData.trackingNumber}</span>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(trackData.trackingNumber)
                                                            toast.success("ID Copied")
                                                        }}
                                                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                                                    >
                                                        <Search size={14} className="text-primary opacity-40 group-hover/tracking:opacity-100 transition-opacity" />
                                                    </button>
                                                </div>
                                                <Link 
                                                    href={
                                                        trackData.courier?.toLowerCase().includes('dhl') ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackData.trackingNumber}` :
                                                        trackData.courier?.toLowerCase().includes('fedex') ? `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackData.trackingNumber}` :
                                                        trackData.courier?.toLowerCase().includes('ups') ? `https://www.ups.com/track?tracknum=${trackData.trackingNumber}` :
                                                        `https://google.com/search?q=track+${trackData.courier}+${trackData.trackingNumber}`
                                                    } 
                                                    target="_blank"
                                                >
                                                    <Button variant="outline" className="w-full h-12 rounded-2xl text-[8px] font-black uppercase tracking-widest gap-2 bg-white border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm">
                                                        EXTERNAL TRACKING <ExternalLink size={10} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 shadow-sm">
                                            <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                                                <Calendar size={12} />
                                                ESTIMATED DELIVERY
                                            </span>
                                            <span className="text-lg font-black text-emerald-600 italic tracking-tight">
                                                {trackData.estimatedDelivery ? new Date(trackData.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD (Processing)'}
                                            </span>
                                            {trackData.estimatedDelivery && new Date(trackData.estimatedDelivery) > new Date() && (
                                                <span className="text-[8px] font-bold text-emerald-500/60 uppercase">
                                                    Inbound in {Math.ceil((new Date(trackData.estimatedDelivery).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Button className="w-full h-16 rounded-[2rem] bg-slate-950 border-none hover:bg-slate-900 text-white text-[10px] font-black italic uppercase tracking-widest gap-3 shadow-2xl mt-4 group">
                                        <MessageSquare size={16} className="group-hover:rotate-12 transition-transform" />
                                        SUPPORT COMMS
                                    </Button>
                                </Card>

                                {/* Alert Card */}
                                <Card className="p-10 rounded-[3rem] border-primary/20 bg-gradient-to-br from-primary/10 to-transparent flex flex-col gap-4 shadow-sm border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Active Protection</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest italic opacity-70">
                                        Our logistics chain is fully encrypted. Each hardware module is tracked and insured for $5M corporate liability coverage.
                                    </p>
                                </Card>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10"
                        >
                            {[
                                { icon: <Globe className="text-primary" />, title: "Planetary Logistics", desc: "Real-time satellite tracking across all deployment sectors." },
                                { icon: <ShieldCheck className="text-primary" />, title: "Insured Transit", desc: "Every module is covered by universal hardware protection." },
                                { icon: <Activity className="text-primary" />, title: "Live Telemetry", desc: "Millisecond-accurate status updates from Kenya Central Hub." }
                            ].map((feat, i) => (
                                <div key={i} className="p-10 rounded-[3rem] bg-muted/20 border border-border flex flex-col gap-6 text-center items-center group hover:bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                    <div className="w-20 h-20 bg-card rounded-[2rem] shadow-xl border border-border flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                        {React.cloneElement(feat.icon as React.ReactElement<any>, { size: 32 })}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-sm font-black uppercase italic tracking-widest">{feat.title}</h4>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 leading-relaxed italic">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
