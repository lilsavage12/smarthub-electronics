"use client"

import React, { useState, useEffect } from "react"
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
import { PromotionManager } from "@/components/admin/PromotionManager"
import { HomepageManager } from "@/components/admin/HomepageManager"

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<any[]>([])
    const [loadingParams, setLoadingParams] = useState(true)
    const [newDiscount, setNewDiscount] = useState<{ id?: string, code: string, type: string, value: string, maxUses: string }>({ code: "", type: "Percentage", value: "", maxUses: "" })

    const [upcomingOffer, setUpcomingOffer] = useState({ title: "Holiday Sale", subtitle: "Ends Soon", discountCode: "", startsIn: "12 days", targetReach: "4.2K Units", progress: 65 })
    const [editPromo, setEditPromo] = useState({ title: "", subtitle: "", discountCode: "", startsIn: "", targetReach: "", progress: 65 })

    const [isNewCodeOpen, setIsNewCodeOpen] = useState(false)
    const [isEditCodeOpen, setIsEditCodeOpen] = useState(false)
    const [isEditPromoOpen, setIsEditPromoOpen] = useState(false)

    const [isPromoActive, setIsPromoActive] = useState(false)
    const [loadingPromo, setLoadingPromo] = useState(false)
    const [activeTab, setActiveTab] = useState<'codes' | 'automated' | 'layout'>('codes')

    const handleNewCode = () => {
        setNewDiscount({ code: "", type: "Percentage", value: "", maxUses: "" })
        setIsNewCodeOpen(true)
    }

    const closeNewCode = () => {
        setIsNewCodeOpen(false)
        setIsEditCodeOpen(false)
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

    const fetchBanner = async () => {
        try {
            const res = await fetch("/api/banner")
            if (res.ok) {
                const data = await res.json()
                if (data && data.title) {
                    setUpcomingOffer({
                        title: data.title,
                        subtitle: data.subtitle,
                        discountCode: data.discountCode || "",
                        startsIn: data.startsIn || "",
                        targetReach: data.targetReach || "",
                        progress: data.progress || 0
                    })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchDiscounts()
        fetchBanner()
    }, [])

    const deleteDiscount = async (id: string, code: string) => {
        if (!id || id === "undefined") {
            toast.error("Invalid discount ID")
            return
        }
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
        if (!id || id === "undefined") return
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

    const handleEditCode = (disc: any) => {
        setNewDiscount({
            id: disc.id,
            code: disc.code,
            type: disc.type,
            value: disc.value === "$0" ? "" : disc.value,
            maxUses: disc.maxUses ? disc.maxUses.toString() : ""
        })
        setIsEditCodeOpen(true)
    }

    const handleSubmitCode = async () => {
        if (!newDiscount.code || (!newDiscount.value && newDiscount.type !== "Free Shipping")) {
            toast.error("Please fill in required fields.");
            return;
        }

        try {
            const isEdit = isEditCodeOpen
            if (isEdit && (!newDiscount.id || newDiscount.id === "undefined")) {
                toast.error("Missing discount ID for update")
                return
            }
            const method = isEdit ? "PATCH" : "POST"
            const url = isEdit ? `/api/discounts/${newDiscount.id}` : "/api/discounts"

            const payload = {
                code: newDiscount.code,
                type: newDiscount.type,
                value: newDiscount.type === "Free Shipping" ? "$0" : newDiscount.value,
            } as any
            if (!isEditCodeOpen) {
                payload.maxUses = newDiscount.maxUses || null
            } else if (newDiscount.maxUses !== undefined) {
                payload.maxUses = newDiscount.maxUses ? parseInt(newDiscount.maxUses) : null
            }


            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(isEditCodeOpen ? "Discount updated successfully." : "Discount created & broadcasted.")
                setNewDiscount({ code: "", type: "Percentage", value: "", maxUses: "" })
                fetchDiscounts()
                closeNewCode()
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to process request")
            }
        } catch (err) {
            toast.error("Network error processing code")
        }
    }

    const handleSaveBanner = async () => {
        try {
            const res = await fetch("/api/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editPromo)
            })
            if (res.ok) {
                setUpcomingOffer(editPromo)
                toast.success("Banner updated on Home Page.")
                setIsEditPromoOpen(false)
            } else {
                toast.error("Failed to update banner")
            }
        } catch (error) {
            toast.error("Network error")
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
        <div className="flex flex-col gap-6 max-w-6xl mx-auto mb-20">
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

            <div className="flex items-center gap-4 border-b border-border pb-1">
                <button 
                    onClick={() => setActiveTab('codes')}
                    className={cn(
                        "pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'codes' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Promo Codes
                    {activeTab === 'codes' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => setActiveTab('automated')}
                    className={cn(
                        "pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'automated' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Automated Promotions
                    {activeTab === 'automated' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => setActiveTab('layout')}
                    className={cn(
                        "pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'layout' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Homepage Layout
                    {activeTab === 'layout' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
            </div>

            {activeTab === 'codes' ? (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                        {/* ... existing code ... */}
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
                                                            handleEditCode(disc)
                                                        }}
                                                        size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600 rounded-md"
                                                    >
                                                        <Edit2 size={14} />
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
                            <CardTitle className="text-xs font-black italic uppercase tracking-tighter">Home Page Banner</CardTitle>
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
                                    <h4 className="text-[11px] font-black uppercase text-foreground">{upcomingOffer.title}</h4>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{upcomingOffer.subtitle}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-muted border border-border rounded-xl flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground opacity-60">Estimated Reach</span>
                                    <span className="text-foreground">{upcomingOffer.targetReach}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground opacity-60">Discount Code</span>
                                    <span className="text-primary italic">{upcomingOffer.discountCode || "N/A"}</span>
                                </div>
                                <div className="flex flex-col gap-1.5 mt-2">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground opacity-60">Funding Progress</span>
                                        <span className="text-primary">{upcomingOffer.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${upcomingOffer.progress}%` }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleStartPromo} disabled={isPromoActive || loadingPromo} className={cn("w-full h-12 rounded-xl font-black italic tracking-widest uppercase text-[10px]", isPromoActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "")}>
                                {loadingPromo ? "Initiating..." : isPromoActive ? "Sale Currently Active" : "Force Start Phase"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal: New / Edit Discount Code */}
            <AnimatePresence>
                {(isNewCodeOpen || isEditCodeOpen) && (
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
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-6">{isEditCodeOpen ? "Edit Promo Code" : "Initialize New Code"}</h2>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">PROMO CODE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SUMMER26"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold uppercase"
                                        value={newDiscount.code}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">DISCOUNT TYPE</label>
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
                                            placeholder={newDiscount.type === "Percentage" ? "e.g. 15%" : "$100"}
                                            className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold disabled:opacity-50"
                                            value={newDiscount.type === "Free Shipping" ? "Free" : newDiscount.value}
                                            disabled={newDiscount.type === "Free Shipping"}
                                            onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">MAX USES (OPTIONAL)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1000"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                        value={newDiscount.maxUses}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, maxUses: e.target.value })}
                                    />
                                </div>

                                <Button onClick={handleSubmitCode} className="h-12 w-full mt-4 bg-primary text-white font-black italic tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-primary/20">
                                    {isEditCodeOpen ? "Save Changes" : "Deploy Code"}
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
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-6">Edit Home Banner</h2>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">CAMPAIGN TITLE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Holiday Sale"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                        value={editPromo.title}
                                        onChange={(e) => setEditPromo({ ...editPromo, title: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">CAMPAIGN SUBTITLE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Get 20% Off All Items"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold"
                                        value={editPromo.subtitle}
                                        onChange={(e) => setEditPromo({ ...editPromo, subtitle: e.target.value })}
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
                                            value={editPromo.targetReach}
                                            onChange={(e) => setEditPromo({ ...editPromo, targetReach: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">DISCOUNT CODE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HOLIDAY20"
                                        className="h-10 border border-border bg-muted/50 rounded-lg px-3 text-sm font-bold uppercase"
                                        value={editPromo.discountCode}
                                        onChange={(e) => setEditPromo({ ...editPromo, discountCode: e.target.value.toUpperCase() })}
                                    />
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

                                <Button onClick={handleSaveBanner} className="h-12 w-full mt-4 bg-primary text-white font-black italic tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-primary/20">
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
                </div>
            ) : activeTab === 'automated' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <PromotionManager />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <HomepageManager />
                </div>
            )}
        </div>
    )
}
