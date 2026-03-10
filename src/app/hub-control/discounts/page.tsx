"use client"

import React, { useState } from "react"
import {
    Percent, Tag, Calendar, Plus,
    Search, Filter, MoreHorizontal, Edit2,
    Trash2, Zap, Clock, CheckCircle2, XCircle,
    RefreshCw, Smartphone, User, Info, DollarSign,
    ArrowRight, Gift, Layers, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const SAMPLE_DISCOUNTS = [
    { id: "DIS-001", code: "HUB-Z-2026", type: "Percentage", value: "15%", usage: "242 / 1000", status: "Active", statusColor: "text-emerald-500 bg-emerald-50", campaign: "2026 Season Launch" },
    { id: "DIS-002", code: "TITAN-FLASH", type: "Fixed Amount", value: "$100", usage: "48 / 50", status: "Near Limit", statusColor: "text-amber-500 bg-amber-50", campaign: "Titanium Flash Sale" },
    { id: "DIS-003", code: "NEW-OFFICER", type: "Percentage", value: "10%", usage: "12", status: "Active", statusColor: "text-emerald-500 bg-emerald-50", campaign: "New Member Protocol" },
    { id: "DIS-004", code: "LEGACY-FREE", type: "Free Shipping", value: "$0", usage: "85", status: "Active", statusColor: "text-emerald-500 bg-emerald-50", campaign: "Loyalty Appreciation" },
]

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<any[]>([])
    const [loadingParams, setLoadingParams] = useState(true)
    const [newDiscount, setNewDiscount] = useState({ code: "", type: "Percentage", value: "", uses: "" })

    const [upcomingOffer, setUpcomingOffer] = useState({ name: "Holiday Sale", startsIn: "12 days", reach: "4.2K Units", progress: 65 })
    const [editPromo, setEditPromo] = useState({ name: "", startsIn: "", reach: "", progress: 65 })

    const [isNewCodeOpen, setIsNewCodeOpen] = useState(false)
    const [isEditPromoOpen, setIsEditPromoOpen] = useState(false)

    const [isPromoActive, setIsPromoActive] = useState(false)
    const [loadingPromo, setLoadingPromo] = useState(false)

    const handleNewCode = () => {
        setIsNewCodeOpen(true)
    }

    const closeNewCode = () => {
        setIsNewCodeOpen(false)
    }

    const fetchDiscounts = async () => {
        try {
            const res = await fetch("/api/discounts")
            if (res.ok) {
                const data = await res.json()
                setDiscounts(data)
            }
        } catch (error) {
            toast.error("Failed to load active discounts")
        } finally {
            setLoadingParams(false)
        }
    }

    React.useEffect(() => {
        fetchDiscounts()
    }, [])


    const handleAction = (id: string) => {
        toast(`Accessing protocol logs for ${id}`, { icon: "📈" })
    }

    const deleteDiscount = async (id: string, code: string) => {
        try {
            const res = await fetch(`/api/discounts/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success(`Deleted ${code}`)
                fetchDiscounts()
            }
        } catch (error) {
            toast.error("Delete failed")
        }
    }

    const toggleDiscount = async (id: string, currentStatus: string, code: string) => {
        const newStatus = currentStatus === "Active" ? "Paused" : "Active"
        try {
            const res = await fetch(`/api/discounts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                toast.success(`${code} is now ${newStatus}`)
                fetchDiscounts()
            }
        } catch (error) {
            toast.error("Status toggle failed")
        }
    }

    const handleStartPromo = () => {
        setLoadingPromo(true)
        const tid = toast.loading("Broadcasting holiday sale protocol to all nodes...")
        setTimeout(() => {
            toast.success("Holiday Sale activated successfully", { id: tid })
            setLoadingPromo(false)
            setIsPromoActive(true)
        }, 2000)
    }



    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-black tracking-tight text-foreground uppercase italic leading-none">Discounts</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage promo codes and special offers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleNewCode}
                        className="h-9 px-5 rounded-lg bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        NEW CODE
                    </Button>
                </div>
            </div>

            {/* Campaign KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Coupons", value: "12 Codes", icon: <Tag size={16} className="text-blue-500" />, sub: "Targeting 8.4% CR" },
                    { label: "Total Saved", value: "$4,245", icon: <DollarSign size={16} className="text-emerald-500" />, sub: "Value distributed" },
                    { label: "Redemptions", value: "842", icon: <RefreshCw size={16} className="text-amber-500" />, sub: "+14% weekly shift" },
                    { label: "Security", value: "Alpha", icon: <ShieldCheck size={16} className="text-primary" />, sub: "Always active" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-xl border-border shadow-sm p-4 bg-card flex flex-col gap-3 group hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">{stat.label}</span>
                            <div className="p-1.5 bg-muted rounded-md relative z-10 group-hover:bg-primary/20 transition-colors">{stat.icon}</div>
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-2xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5">{stat.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Discount Management Hub */}
                <Card className="xl:col-span-2 rounded-2xl border-border shadow-sm overflow-hidden bg-card">
                    <CardHeader className="p-5 border-b border-border">
                        <CardTitle className="text-sm font-black italic tracking-tighter uppercase text-foreground">Promo Codes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-muted">
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Type & Value</th>
                                        <th className="px-6 py-4">Usage</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {discounts.map((disc, i) => (
                                        <tr key={i} className="hover:bg-muted/50 transition-all duration-500 group cursor-pointer border-b border-border last:border-0 h-16">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-black italic tracking-[0.1em] text-foreground uppercase group-hover:text-primary transition-colors">{disc.id}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">{disc.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-black italic text-foreground tracking-tight">{disc.value}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic">{disc.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground">{disc.usedCount} {disc.maxUses ? `/ ${disc.maxUses}` : ""}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">USES</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest leading-none", disc.status === 'Active' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border border-amber-500/20 text-amber-500')}>
                                                    {disc.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleDiscount(disc.id, disc.status, disc.code)
                                                        }}
                                                        size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:text-amber-600 rounded-md"
                                                    >
                                                        <Clock size={14} />
                                                    </Button>
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteDiscount(disc.id, disc.code)
                                                        }}
                                                        size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 rounded-md"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Campaign Insights */}
                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card transition-colors">
                        <CardHeader className="p-5 border-b border-border bg-slate-900 dark:bg-slate-950 text-white flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black italic uppercase tracking-tighter">Upcoming Offer</CardTitle>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-white/60 hover:text-white" onClick={() => {
                                setEditPromo(upcomingOffer)
                                setIsEditPromoOpen(true)
                            }}>
                                <Edit2 size={12} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Gift size={24} className="text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[11px] font-black uppercase text-foreground">{upcomingOffer.name}</h4>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Starts in {upcomingOffer.startsIn}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-muted border border-border rounded-xl flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground opacity-60">Estimated Reach</span>
                                    <span className="text-foreground">{upcomingOffer.reach}</span>
                                </div>
                                <div className="h-1 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${upcomingOffer.progress}%` }} />
                                </div>
                            </div>
                            {isPromoActive ? (
                                <div className="flex items-center justify-center h-10 bg-emerald-500/10 text-emerald-500 rounded-lg font-black italic tracking-widest uppercase text-[9px] border border-emerald-500/20">
                                    <CheckCircle2 size={14} className="mr-2" />
                                    PROMO RUNNING
                                </div>
                            ) : (
                                <Button
                                    onClick={handleStartPromo}
                                    disabled={loadingPromo}
                                    className="w-full bg-primary text-primary-foreground hover:opacity-90 h-10 rounded-lg font-black italic tracking-widest uppercase text-[9px] shadow-lg shadow-primary/10 transition-all active:scale-95"
                                >
                                    {loadingPromo ? <RefreshCw className="animate-spin" size={14} /> : "START PROMO"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border shadow-sm overflow-hidden bg-card p-5">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-primary" fill="currentColor" />
                                <span className="text-[9px] font-black uppercase tracking-widest italic opacity-80 text-foreground">Conversion Signal</span>
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed font-inter text-muted-foreground italic">"FREE-SHIP codes have a 12% higher checkout completion rate compared to $ discounts."</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* New Code Overlay Modal */}
            <AnimatePresence>
                {isNewCodeOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative"
                        >
                            <button onClick={closeNewCode} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                <XCircle size={20} />
                            </button>
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-6">Create New Discount</h2>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">DISCOUNT CODE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SUMMER2026"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold uppercase"
                                        value={newDiscount.code}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">TYPE</label>
                                        <select
                                            className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                            value={newDiscount.type}
                                            onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                                        >
                                            <option>Percentage</option>
                                            <option>Fixed Amount</option>
                                            <option>Free Shipping</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">VALUE</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 15%"
                                            className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                            value={newDiscount.value}
                                            onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">MAXIMUM USES</label>
                                    <input
                                        type="number"
                                        placeholder="Leave empty for unlimited"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                        value={newDiscount.uses}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, uses: e.target.value })}
                                    />
                                </div>

                                <Button onClick={async () => {
                                    if (!newDiscount.code || (!newDiscount.value && newDiscount.type !== "Free Shipping")) {
                                        toast.error("Please fill in required fields.");
                                        return;
                                    }

                                    try {
                                        const res = await fetch("/api/discounts", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                code: newDiscount.code,
                                                type: newDiscount.type,
                                                value: newDiscount.type === "Free Shipping" ? "$0" : newDiscount.value,
                                                maxUses: newDiscount.uses || null
                                            })
                                        })

                                        if (res.ok) {
                                            toast.success("Discount created & broadcasted.")
                                            setNewDiscount({ code: "", type: "Percentage", value: "", uses: "" })
                                            fetchDiscounts()
                                            closeNewCode()
                                        } else {
                                            const err = await res.json()
                                            toast.error(err.error || "Failed to create code")
                                        }
                                    } catch (err) {
                                        toast.error("Network error creating code")
                                    }
                                }} className="h-12 w-full mt-4 bg-primary text-white font-black italic tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-primary/20">
                                    Deploy Code
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Upcoming Promo Overlay Modal */}
            <AnimatePresence>
                {isEditPromoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative"
                        >
                            <button onClick={() => setIsEditPromoOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                <XCircle size={20} />
                            </button>
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-6">Edit Upcoming Offer</h2>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">CAMPAIGN NAME</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Holiday Sale"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold uppercase"
                                        value={editPromo.name}
                                        onChange={(e) => setEditPromo({ ...editPromo, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">STARTS IN</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 12 days"
                                            className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                            value={editPromo.startsIn}
                                            onChange={(e) => setEditPromo({ ...editPromo, startsIn: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">EST. REACH</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 4.2K Units"
                                            className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                            value={editPromo.reach}
                                            onChange={(e) => setEditPromo({ ...editPromo, reach: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">BUDGET PROGRESS (%)</label>
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        placeholder="0"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                        value={editPromo.progress}
                                        onChange={(e) => setEditPromo({ ...editPromo, progress: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <Button onClick={() => {
                                    setUpcomingOffer(editPromo)
                                    toast.success("Upcoming offer details synced.")
                                    setIsEditPromoOpen(false)
                                }} className="h-12 w-full mt-4 bg-primary text-white font-black italic tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-primary/20">
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
