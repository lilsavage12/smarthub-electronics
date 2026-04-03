"use client"

import React, { useState, useEffect } from "react"
import {
    Percent, Tag, Calendar, Plus,
    Search, Filter, MoreHorizontal, Edit2,
    Trash2, Zap, Clock, CheckCircle2, XCircle,
    RefreshCw, Smartphone, User, Info, DollarSign,
    ArrowRight, Gift, Layers, ShieldCheck, Settings,
    X, Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { PromotionManager } from "@/components/admin/PromotionManager"
import { useRef } from "react"

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<any[]>([])
    const [loadingParams, setLoadingParams] = useState(true)
    const promoRef = useRef<any>(null)
    const [promoTab, setPromoTab] = useState<'active' | 'scheduled' | 'expired'>('active')
    const [newDiscount, setNewDiscount] = useState<{ id?: string, code: string, type: string, value: string, maxUses: string, minPurchase?: string, startDate?: string, endDate?: string, isActive?: boolean }>({ 
        code: "", type: "Percentage", value: "", maxUses: "", minPurchase: "", 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true 
    })

    const [upcomingOffer, setUpcomingOffer] = useState({ title: "Holiday Sale", subtitle: "Ends Soon", discountCode: "", startsIn: "12 days", targetReach: "4.2K Units", progress: 65 })
    const [editPromo, setEditPromo] = useState({ title: "", subtitle: "", discountCode: "", startsIn: "", targetReach: "", progress: 65 })

    const [isNewCodeOpen, setIsNewCodeOpen] = useState(false)
    const [isEditCodeOpen, setIsEditCodeOpen] = useState(false)
    const [isPromoActive, setIsPromoActive] = useState(false)
    const [loadingPromo, setLoadingPromo] = useState(false)
    const [promotions, setPromotions] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'codes' | 'automated'>('codes')
    const [cmsSettings, setCmsSettings] = useState<any>({ showFlashSale: true, showFeatured: true, showDeals: true })

    const handleNewCode = () => {
        setNewDiscount({ 
            code: "", type: "Percentage", value: "", maxUses: "", minPurchase: "", 
            startDate: new Date().toISOString().split('T')[0], 
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true 
        })
        setIsNewCodeOpen(true)
    }

    const closeNewCode = () => {
        setIsNewCodeOpen(false)
        setIsEditCodeOpen(false)
    }

    const fetchAllData = async () => {
        try {
            const [discRes, promoRes] = await Promise.all([
                fetch("/api/discounts"),
                fetch("/api/promotions")
            ])
            if (discRes.ok) {
                const data = await discRes.json()
                setDiscounts(data)
            } else {
                const err = await discRes.json()
                toast.error(`Discounts: ${err.details || "Load Error"}`)
            }
            if (promoRes.ok) {
                const data = await promoRes.json()
                setPromotions(data)
            } else {
                const err = await promoRes.json()
                toast.error(`Promotions: ${err.details || "Load Error"}`)
            }
        } catch (error) {
            console.error("Data fetch error:", error)
            toast.error("Failed to load all data")
        } finally {
            setLoadingParams(false)
        }
    }


    const fetchCmsSettings = async () => {
        try {
            const res = await fetch("/api/cms/settings")
            if (res.ok) {
                const data = await res.json()
                setCmsSettings(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const updateCmsSettings = async (updates: any) => {
        try {
            const newSettings = { ...cmsSettings, ...updates }
            setCmsSettings(newSettings)
            const res = await fetch("/api/cms/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings)
            })
            if (res.ok) {
                toast.success("Settings updated")
            }
        } catch (error) {
            toast.error("Sync Failed")
        }
    }

    useEffect(() => {
        fetchAllData()
        fetchCmsSettings()
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
                fetchAllData()
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
                fetchAllData()
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
            value: disc.value === "KSh 0" ? "" : disc.value,
            maxUses: disc.maxUses ? disc.maxUses.toString() : "",
            minPurchase: disc.minPurchase ? disc.minPurchase.toString() : "",
            startDate: disc.startDate ? new Date(disc.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: disc.endDate ? new Date(disc.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: disc.status === "ACTIVE"
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
                value: newDiscount.type === "Free Shipping" ? "KSh 0" : newDiscount.value,
                startDate: new Date(newDiscount.startDate || Date.now()).toISOString(),
                endDate: newDiscount.endDate === "NEVER" ? null : new Date(newDiscount.endDate || (Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
                minPurchase: newDiscount.minPurchase ? parseFloat(newDiscount.minPurchase) : 0,
                status: newDiscount.isActive ? "ACTIVE" : "INACTIVE",
                maxUses: newDiscount.maxUses ? parseInt(newDiscount.maxUses) : null
            } as any


            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(isEditCodeOpen ? "Discount updated successfully." : "Discount created successfully.")
                setNewDiscount({ code: "", type: "Percentage", value: "", maxUses: "" })
                fetchAllData()
                closeNewCode()
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to process request")
            }
        } catch (err) {
            toast.error("Network error processing code")
        }
    }


    const handleStartPromo = () => {
        setLoadingPromo(true)
        const tid = toast.loading("Activating holiday sale...")
        setTimeout(() => {
            toast.success("Holiday Sale activated successfully", { id: tid })
            setLoadingPromo(false)
            setIsPromoActive(true)
        }, 2000)
    }

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Promotion <span className="text-primary">Management</span></h1>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">Manage discount codes and automated storewide promotions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleNewCode}
                        className="h-14 px-8 rounded-2xl bg-muted/30 text-foreground font-black italic uppercase tracking-widest text-[9px] gap-3 border border-border/50 hover:bg-muted/50 transition-all"
                    >
                        <Plus size={18} /> CREATE DISCOUNT
                    </Button>
                    <Button
                        onClick={() => promoRef.current?.openForm()}
                        className="h-14 px-10 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] gap-3 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] hover:scale-105 transition-all active:scale-95 border border-primary/20"
                    >
                        <Plus size={20} /> CREATE PROMOTION
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
            </div>

            {/* Performance Overview (Removed) */}

            {activeTab === 'codes' ? (
                <>
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="mb-8">
                        {/* Discount Management */}
                        <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card">
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
                    </div>

                    {/* Side Drawer: New / Edit Discount Code (Consistent with Promotion Manager) */}
                    <AnimatePresence>
                        {(isNewCodeOpen || isEditCodeOpen) && (
                            <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden p-0">
                                <motion.div
                                    initial={{ x: "100%", opacity: 0.5 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: "100%", opacity: 0.5 }}
                                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                    className="w-full lg:max-w-xl h-full bg-card border-l border-border shadow-[-20px_0_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
                                >
                                    <div className="p-8 md:p-10 border-b border-border flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-xl z-20 sticky top-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20 animate-in zoom-in">
                                                <Tag size={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Discount <span className="text-primary">Editor</span></h2>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Configure criteria and rewards</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button 
                                                onClick={handleSubmitCode} 
                                                className="h-12 px-8 rounded-xl bg-primary text-white font-black italic uppercase tracking-widest text-[9px] gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                            >
                                                <Save size={16} /> {isEditCodeOpen ? "SAVE" : "CREATE"}
                                            </Button>
                                            <button 
                                                onClick={closeNewCode} 
                                                className="h-12 w-12 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center transition-all text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 shadow-sm"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col gap-12 custom-scrollbar">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic opacity-60">Discount Code</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. SUMMER26"
                                                className="h-16 border border-border bg-muted/30 rounded-2xl px-8 text-sm font-black uppercase italic tracking-widest focus:border-primary/30 outline-none transition-all"
                                                value={newDiscount.code}
                                                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic opacity-60">Discount Type</label>
                                                <select
                                                    className="h-16 border border-border bg-muted/30 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/30 transition-all cursor-pointer"
                                                    value={newDiscount.type}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                                                >
                                                    <option>Percentage</option>
                                                    <option>Fixed Amount</option>
                                                    <option>Free Shipping</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic opacity-60">Discount Value</label>
                                                <input
                                                    type="text"
                                                    placeholder={newDiscount.type === "Percentage" ? "e.g. 15%" : "KSh 1000"}
                                                    className="h-16 border border-border bg-muted/30 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 focus:border-primary/30 outline-none transition-all"
                                                    value={newDiscount.type === "Free Shipping" ? "Free" : newDiscount.value}
                                                    disabled={newDiscount.type === "Free Shipping"}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic opacity-60">Usage Limit</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 1000"
                                                    className="h-16 border border-border bg-muted/30 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest focus:border-primary/30 outline-none transition-all"
                                                    value={newDiscount.maxUses}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, maxUses: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic opacity-60">Min. Purchase</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 500"
                                                    className="h-16 border border-border bg-muted/30 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest focus:border-primary/30 outline-none transition-all"
                                                    value={newDiscount.minPurchase}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, minPurchase: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic opacity-60">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="h-16 border border-border bg-muted/30 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest focus:border-primary/30 outline-none transition-all"
                                                    value={newDiscount.startDate}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic opacity-60">End Date</label>
                                                    <button 
                                                        onClick={() => setNewDiscount({ ...newDiscount, endDate: newDiscount.endDate === "NEVER" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : "NEVER" })}
                                                        className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border transition-all", newDiscount.endDate === "NEVER" ? "bg-primary text-white border-primary" : "text-muted-foreground border-border")}
                                                    >
                                                        {newDiscount.endDate === "NEVER" ? "Indefinite Active" : "Set Indefinite"}
                                                    </button>
                                                </div>
                                                <input
                                                    type="date"
                                                    disabled={newDiscount.endDate === "NEVER"}
                                                    className="h-16 border border-border bg-muted/30 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest focus:border-primary/30 outline-none transition-all disabled:opacity-20 disabled:grayscale"
                                                    value={newDiscount.endDate === "NEVER" ? "" : newDiscount.endDate}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-8 bg-muted/20 border border-border rounded-[2rem] shadow-inner">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black italic uppercase tracking-tighter text-foreground">Discount Status</span>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">Global Visibility</span>
                                            </div>
                                            <button 
                                                onClick={() => setNewDiscount({ ...newDiscount, isActive: !newDiscount.isActive })}
                                                className={cn(
                                                    "h-12 px-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic shadow-md",
                                                    newDiscount.isActive ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {newDiscount.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer Removed */}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>


                </div>
                </>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col gap-8 mb-4">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                                <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                                    {(['active', 'scheduled', 'expired'] as const).map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setPromoTab(tab)}
                                            className={cn(
                                                "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                promoTab === tab ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 px-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Settings size={14} className="text-primary" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-primary italic">Homepage Section Visibility</span>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Toggle active sections on the storefront homepage.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {[
                                { id: "showFlashSale", label: "Flash Sale", desc: "Limited time scarcity events" },
                                { id: "showFeatured", label: "Featured", desc: "Top-tier catalog highlights" },
                                { id: "showDeals", label: "Top Deals", desc: "Showcase promotional catalog segments" },
                            ].map((sec) => (
                                <div 
                                    key={sec.id} 
                                    className="group flex flex-col gap-4 p-8 bg-muted/20 border border-border/50 rounded-[2rem] hover:border-primary/40 transition-all hover:bg-muted/40 shadow-inner"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase italic text-foreground group-hover:text-primary transition-colors">{sec.label}</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none opacity-60 italic">{sec.desc}</span>
                                        </div>
                                        <div 
                                            onClick={() => updateCmsSettings({ [sec.id]: !cmsSettings[sec.id] })}
                                            className={cn(
                                                "relative w-12 h-6 rounded-full transition-colors cursor-pointer border border-border/50",
                                                cmsSettings[sec.id] !== false ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" : "bg-muted shadow-inner"
                                            )}
                                        >
                                            <motion.div 
                                                animate={{ x: cmsSettings[sec.id] !== false ? 24 : 2 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    <PromotionManager onUpdate={fetchAllData} ref={promoRef} activeTab={promoTab} />
                </div>
            )}
        </div>
    )
}
