
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
    Zap, Clock, Calendar, Plus, Trash2, 
    Edit2, Percent, DollarSign, CheckCircle2,
    XCircle, Smartphone, Tag, ArrowRight,
    Search, Filter, Info, AlertTriangle,Eye,
    ChevronRight, Save, X, Layers, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

import { forwardRef, useImperativeHandle } from "react"

export const PromotionManager = forwardRef(({ onUpdate, activeTab: externalTab }: { onUpdate?: () => void, activeTab?: 'active' | 'scheduled' | 'expired' }, ref) => {
    const [promotions, setPromotions] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [internalTab, setInternalTab] = useState<'active' | 'scheduled' | 'expired'>('active')
    
    // Sync externalTab to internal state or just use externalTab
    const activeTab = externalTab || internalTab;
    
    // Modal & Selection
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "PERCENTAGE", // PERCENTAGE, FIXED
        category: "REGULAR", // REGULAR, FLASH_SALE, EXCLUSIVE
        discount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        priority: 0,
        saleStock: "",
        showOnHome: true
    })

    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        try {
            const [promoRes, prodRes] = await Promise.all([
                fetch("/api/promotions"),
                fetch("/api/products")
            ])
            if (promoRes.ok) setPromotions(await promoRes.json())
            if (prodRes.ok) setProducts(await prodRes.json())
        } catch (error) {
            toast.error("Failed to load promotions")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredPromotions = useMemo(() => {
        const now = new Date().getTime()
        return promotions.filter(p => {
            const start = new Date(p.startDate).getTime()
            const end = p.endDate ? new Date(p.endDate).getTime() : 1e15 // Large far-future constant for perpetuals
            
            const isActiveNow = p.isActive && start <= now && end >= now
            const isScheduled = p.isActive && start > now
            const isExpired = !p.isActive || end < now
            
            if (activeTab === 'active') return isActiveNow
            if (activeTab === 'scheduled') return isScheduled && !isActiveNow
            if (activeTab === 'expired') return isExpired && !isActiveNow && !isScheduled
            return false
        })
    }, [promotions, activeTab])

    const conflictWarnings = useMemo(() => {
        if (selectedProducts.length === 0) return []
        const conflicts: string[] = []
        selectedProducts.forEach(pid => {
            const hasActive = promotions.filter(p => p.isActive && (!p.endDate || new Date(p.endDate) > new Date())).some(p => p.productId === pid)
            if (hasActive) {
                const prod = products.find(pr => pr.id === pid)
                if (prod) conflicts.push(prod.name)
            }
        })
        return conflicts
    }, [selectedProducts, promotions, products])

    const handleOpenForm = (promo: any = null) => {
        if (promo) {
            setEditingId(promo.id)
            setFormData({
                name: promo.name || promo.title,
                description: promo.description || "",
                type: promo.type,
                category: promo.category,
                discount: promo.discount,
                startDate: new Date(promo.startDate).toISOString().split('T')[0],
                endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : "NEVER",
                isActive: promo.isActive,
                priority: promo.priority,
                saleStock: promo.saleStock?.toString() || "",
                showOnHome: promo.showOnHome !== undefined ? promo.showOnHome : true
            })
            const productIds = Array.isArray(promo.products) ? promo.products.map((p: any) => p.productId) : [promo.productId]
            setSelectedProducts(productIds.filter(Boolean))
        } else {
            setEditingId(null)
            setFormData({
                name: "New Campaign",
                description: "",
                type: "PERCENTAGE",
                category: "REGULAR",
                discount: 10,
                startDate: new Date().toISOString().split('T')[0],
                endDate: "NEVER",
                isActive: true,
                priority: 0,
                saleStock: "",
                showOnHome: true
            })
            setSelectedProducts([])
        }
        setIsFormOpen(true)
    }

    const savePromotion = async () => {
        if (selectedProducts.length === 0) return toast.error("Select target products.")
        if (formData.discount <= 0) return toast.error("Discount value required.")
        
        setIsSaving(true)
        const tid = toast.loading("Saving promotion...")
        
        try {
            if (editingId) {
                // Unified Update: Send all selected products
                const payload = { 
                    ...formData, 
                    productIds: selectedProducts,
                    endDate: formData.endDate === "NEVER" ? null : formData.endDate
                }
                const res = await fetch(`/api/promotions/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                if (res.ok) {
                    const data = await res.json()
                    // Sync logic handled here
                }
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.error || err.details || "Update failure")
                }
            } else {
                // UNIFIED CREATION: Send one payload for all selected products
                const payload = { 
                    ...formData, 
                    productIds: selectedProducts,
                    endDate: formData.endDate === "NEVER" ? null : formData.endDate
                }
                const res = await fetch("/api/promotions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.error || err.details || "Creation failure")
                }
            }

            toast.success("Promotion saved successfully.", { id: tid })
            fetchPromotions()
            if (onUpdate) onUpdate()
            setIsFormOpen(false)
        } catch (error: any) {
            toast.error(error.message || "Connection error.", { id: tid })
        } finally {
            setIsSaving(false)
        }
    }

    const deletePromo = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return
        const tid = toast.loading("Deleting promotion...")
        try {
            const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Promotion deleted.", { id: tid })
                fetchPromotions()
                if (onUpdate) onUpdate()
            }
        } catch (error) {
            toast.error("Delete failure.", { id: tid })
        }
    }

    useImperativeHandle(ref, () => ({
        openForm: () => handleOpenForm()
    }))

    if (isLoading) return <div className="py-20 flex justify-center"><Zap className="animate-pulse text-primary h-8 w-8" /></div>

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            
            {/* A. DASHBOARD NAVIGATION */}
            {/* B. PROMOTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredPromotions.map((promo) => (
                        <motion.div 
                            key={promo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative bg-card border border-border/50 rounded-[2rem] p-8 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Zap size={64} className="text-primary" />
                            </div>
                            
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest  border", 
                                        promo.category === 'FLASH_SALE' ? "bg-rose-500 text-white border-rose-600" : "bg-primary/10 text-primary border-primary/20")}>
                                        {promo.category.replace('_', ' ')}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenForm(promo)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => deletePromo(promo.id)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-black  tracking-tighter group-hover:text-primary transition-colors">{promo.name}</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest truncate">
                                        {(promo.products?.length || 0) > 1 
                                            ? `${promo.products.length} Products Included` 
                                            : (promo.products?.[0]?.name || promo.product?.name || "All Products")}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black  tracking-tighter text-primary">{promo.type === 'PERCENTAGE' ? `${promo.discount}%` : `KSh ${Math.round(promo.discount).toLocaleString()}`}</span>
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em] ">DISCOUNT</span>
                                    </div>
                                    <div className="w-[1px] h-8 bg-border" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black  text-foreground uppercase">{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : "PERPETUAL"}</span>
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em] ">EXPIRATION</span>
                                    </div>
                                    {promo.saleStock && (
                                        <>
                                            <div className="w-[1px] h-8 bg-border" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black  text-rose-500 uppercase">{(promo.soldInPromo || 0)} / {promo.saleStock}</span>
                                                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em] ">UNITS SOLD</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Priority Level</span>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className={cn("w-3 h-1 rounded-full", i < promo.priority ? "bg-primary" : "bg-muted")} />
                                            ))}
                                        </div>
                                    </div>
                                    <ArrowRight className="text-muted-foreground/20 group-hover:text-primary transition-colors" size={16} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredPromotions.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[4rem] opacity-30 text-center">
                    <Layers size={48} className="text-muted-foreground" />
                    <span className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] ">No active promotions</span>
                </div>
            )}

            {/* C. PROMOTION CONFIGURATION DRAWER */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden p-0">
                        <motion.div 
                            initial={{ x: "100%", opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0.5 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="w-full lg:max-w-3xl h-full bg-card border-l border-border shadow-[-20px_0_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
                        >
                            
                            {/* PERSISTENT HEADER DETAILS */}
                            <div className="p-8 md:p-10 border-b border-border bg-card/60 backdrop-blur-xl flex items-center justify-between shrink-0 sticky top-0 z-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20 animate-in zoom-in">
                                        <Zap size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-black  uppercase tracking-tighter text-foreground">Promotion <span className="text-primary">Editor</span></h2>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Configure Campaign</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        onClick={savePromotion} 
                                        disabled={isSaving}
                                        className="h-12 px-8 rounded-xl bg-primary text-white font-black  uppercase tracking-widest text-[9px] gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                        {isSaving ? "SAVING..." : "SAVE PROMOTION"}
                                    </Button>
                                    <button 
                                        onClick={() => setIsFormOpen(false)} 
                                        className="h-12 w-12 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all shadow-sm"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* SCROLLABLE CONFIGURATION DETAILS */}
                            <div className="flex-1 p-8 md:p-14 flex flex-col gap-14 overflow-y-auto custom-scrollbar">


                                {/* SECTION A: BASIC INFO */}
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-black ">A</div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Campaign Details</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 font-inter">Identify the promotion name</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-2 ">Campaign Name</label>
                                            <input 
                                                placeholder="e.g. Summer Peak 2026..."
                                                className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-xs font-black uppercase tracking-widest placeholder:text-muted-foreground/30 focus:border-primary transition-all outline-none "
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-2 ">Detailed Description</label>
                                            <input 
                                                placeholder="Optional context..."
                                                className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-xs font-black uppercase tracking-widest placeholder:text-muted-foreground/30 focus:border-primary transition-all outline-none"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                 {/* SECTION B: CONFIGURATION */}
                                 <div className="flex flex-col gap-8">
                                     <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-black ">B</div>
                                         <div className="flex flex-col">
                                             <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Discount Logic</span>
                                             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 font-inter">Configure discount structures</span>
                                         </div>
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                          <div className="flex flex-col gap-3">
                                             <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-2 ">Logic type</label>
                                             <select 
                                                 className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer"
                                                 value={formData.type}
                                                 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                             >
                                                 <option value="PERCENTAGE">PERCENTAGE (%)</option>
                                                 <option value="FIXED">FIXED AMOUNT (KSh)</option>
                                             </select>
                                         </div>
                                         <div className="flex flex-col gap-3">
                                             <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-2 ">Benefit Value</label>
                                             <input 
                                                 type="number"
                                                 className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-sm font-black  text-primary focus:border-primary outline-none transition-all"
                                                 value={formData.discount}
                                                 onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                                             />
                                         </div>
                                         <div className="flex flex-col gap-3">
                                             <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-2 ">Promotion Category</label>
                                             <select 
                                                 className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer"
                                                 value={formData.category}
                                                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                             >
                                                 <option value="REGULAR">REGULAR DEAL</option>
                                                 <option value="FLASH_SALE">FLASH SALE</option>
                                                 <option value="DAILY_DEAL">DAILY DEAL</option>
                                                 <option value="EXCLUSIVE">EXCLUSIVE</option>
                                             </select>
                                         </div>
                                         <div className="flex flex-col gap-3">
                                             <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-2 ">Stock Limit (Units)</label>
                                             <input 
                                                 type="number"
                                                 placeholder="UNLIMITED"
                                                 className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-sm font-black  text-foreground focus:border-primary placeholder:text-muted-foreground/20 outline-none transition-all"
                                                 value={formData.saleStock}
                                                 onChange={(e) => setFormData({ ...formData, saleStock: e.target.value })}
                                             />
                                         </div>
                                     </div>
                                 </div>

                                 {/* Visibility */}
                                 <div className="p-6 bg-muted/10 rounded-2xl border border-border/50">
                                     <div className="flex items-center justify-between">
                                         <div className="flex flex-col gap-1">
                                             <span className="text-[10px] font-black uppercase  text-foreground leading-none">Display on Home</span>
                                             <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none opacity-60">Show this campaign on the site front</span>
                                         </div>
                                         <Button 
                                             type="button"
                                             variant={formData.showOnHome ? "default" : "outline"}
                                             className={cn("h-8 px-4 rounded-xl text-[9px] font-black uppercase ", formData.showOnHome ? "bg-primary" : "opacity-40")}
                                             onClick={() => setFormData(prev => ({ ...prev, showOnHome: !prev.showOnHome }))}
                                         >
                                             {formData.showOnHome ? "ACTIVE" : "HIDDEN"}
                                         </Button>
                                     </div>
                                 </div>

                                {/* SECTION C: SELECTION */}
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-black ">C</div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Target Products</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 font-inter">Select products for promotion</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="relative group">
                                            <div className="absolute inset-x-0 -bottom-2 h-1 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                                            <input 
                                                className="w-full h-16 bg-muted/40 border border-border rounded-[1.5rem] pl-16 pr-8 text-[11px] font-black uppercase outline-none focus:border-primary transition-all shadow-inner"
                                                placeholder="SEARCH PRODUCTS..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto p-4 bg-muted/10 rounded-[2rem] border border-border custom-scrollbar">
                                            {products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                                <button 
                                                    key={p.id}
                                                    onClick={() => selectedProducts.includes(p.id) ? setSelectedProducts(prev => prev.filter(i => i !== p.id)) : setSelectedProducts(prev => [...prev, p.id])}
                                                    className={cn("p-5 border rounded-[1.25rem] transition-all text-left flex flex-col gap-2 group/item", 
                                                        selectedProducts.includes(p.id) ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-card border-border hover:border-primary/40 hover:bg-muted/50")}
                                                >
                                                    <span className={cn("text-[10px] font-black uppercase truncate", selectedProducts.includes(p.id) ? "text-white" : "text-foreground group-hover/item:text-primary")}>{p.name}</span>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className={cn("text-[8px] font-black uppercase tracking-widest", selectedProducts.includes(p.id) ? "text-white/80" : "text-muted-foreground opacity-60")}>KSh {Math.round(p.price).toLocaleString()}</span>
                                                        <div className={cn("w-2 h-2 rounded-full", selectedProducts.includes(p.id) ? "bg-white animate-pulse" : "bg-muted")} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {conflictWarnings.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-4 items-start shadow-xl shadow-rose-500/5">
                                                <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-1" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Promotion Conflict Detected</span>
                                                    <p className="text-[9px] font-bold text-rose-500/70 uppercase leading-relaxed mt-1 tracking-wider ">The following products already have active promotions: <span className="text-rose-500">{conflictWarnings.join(", ")}</span>.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION D: SCHEDULING */}
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-black ">D</div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Campaign Duration</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 font-inter">Set promotion active dates</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                         <div className="flex flex-col gap-3">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-2 ">Start Date</label>
                                            <input 
                                                type="date"
                                                className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-xs font-black uppercase tracking-widest focus:border-primary transition-all outline-none"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>
                                         <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest  opacity-60">End Date</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, endDate: formData.endDate === "NEVER" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : "NEVER" })}
                                                    className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border transition-all", formData.endDate === "NEVER" ? "bg-primary text-white border-primary" : "text-muted-foreground border-border")}
                                                >
                                                    {formData.endDate === "NEVER" ? "Always Active" : "Set Never Expire"}
                                                </button>
                                            </div>
                                            <input 
                                                type="date"
                                                disabled={formData.endDate === "NEVER"}
                                                className="h-16 bg-muted/40 border border-border rounded-2xl px-6 text-xs font-black uppercase tracking-widest focus:border-primary transition-all outline-none disabled:opacity-20"
                                                value={formData.endDate === "NEVER" ? "" : formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION E: STATUS */}
                                <div className="flex items-center justify-between p-10 bg-muted/20 border border-border rounded-[2.5rem] mt-6 shadow-inner">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
                                            <span className="text-lg font-black  uppercase tracking-tighter">Live Status</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Toggle promotion visibility on the storefront.</p>
                                    </div>
                                    <button 
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={cn("h-14 px-10 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ", 
                                            formData.isActive ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-200 text-slate-500 border border-border/50")}
                                    >
                                        {formData.isActive ? "Active" : "Inactive"}
                                    </button>
                                </div>

                                <Button 
                                    onClick={savePromotion} 
                                    disabled={isSaving}
                                    className="h-24 w-full rounded-[2.5rem] bg-foreground text-background font-black  tracking-[.4em] uppercase text-sm shadow-2xl mt-8 mb-10 hover:bg-primary hover:text-white transition-all ring-8 ring-background group"
                                >
                                    {isSaving ? (
                                        <div className="flex items-center gap-4">
                                            <RefreshCw className="animate-spin" size={24} />
                                            <span>SAVING...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Save size={24} className="group-hover:scale-125 transition-transform" />
                                            <span>SAVE PROMOTION</span>
                                        </div>
                                    )}
                                </Button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
})

PromotionManager.displayName = "PromotionManager"

