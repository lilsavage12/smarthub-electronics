
"use client"

import React, { useState, useEffect } from "react"
import { 
    Zap, Clock, Calendar, Plus, Trash2, 
    Edit2, Percent, DollarSign, CheckCircle2,
    XCircle, Smartphone, Tag, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export const PromotionManager = () => {
    const [promotions, setPromotions] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [productStocks, setProductStocks] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        title: "",
        type: "PERCENTAGE",
        value: "",
        category: "REGULAR",
        startDate: "",
        endDate: "",
        bannerUrl: "",
        description: "",
        isExclusive: false,
        showOnHome: true
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const uploadFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return

        setIsUploading(true)
        const toastId = toast.loading("Uploading banner...")

        try {
            const formData = new FormData()
            Array.from(files).forEach(file => {
                if (file.size > 5 * 1024 * 1024) throw new Error(`Image ${file.name} exceeds 5MB limit.`)
                formData.append('file', file)
            })

            const res = await fetch("/api/upload", { method: "POST", body: formData })
            const data = await res.json()
            if (!data.success) throw new Error(data.error || "Upload failed")

            // Promotion only supports one banner
            setFormData(prev => ({ ...prev, bannerUrl: data.urls[0] }))
            toast.success(`Banner uploaded successfully`, { id: toastId })
        } catch (error: any) {
            console.error("Banner upload failed:", error)
            toast.error(`Error: ${error.message || "Upload failed"}`, { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            await uploadFiles(e.target.files)
            e.target.value = ""
        }
    }

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        const files: File[] = []
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile()
                if (blob) {
                    const file = new File([blob], `promo_banner_${Date.now()}.png`, { type: blob.type });
                    files.push(file)
                }
            }
        }
        if (files.length > 0) {
            e.preventDefault()
            await uploadFiles(files)
        }
    }

    const fetchPromotions = async () => {
        try {
            const res = await fetch("/api/promotions")
            if (res.ok) {
                const data = await res.json()
                setPromotions(data)
            }
        } catch (error) {
            toast.error("Failed to load promotions")
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products")
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            await Promise.all([fetchPromotions(), fetchProducts()])
            setIsLoading(false)
        }
        init()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedProducts.length === 0) {
            toast.error("Please select at least one product")
            return
        }

        try {
            const isEditing = !!editingId
            const method = isEditing ? "PATCH" : "POST"
            const url = isEditing ? `/api/promotions/${editingId}` : "/api/promotions"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    products: selectedProducts
                        .filter(id => id && id !== "undefined")
                        .map(id => ({
                            id,
                            saleStock: productStocks[id] ? parseInt(productStocks[id]) : null
                        }))
                })
            })

            if (res.ok) {
                toast.success(isEditing ? "Promotion updated" : "Promotion created successfully")
                setIsModalOpen(false)
                setEditingId(null)
                fetchPromotions()
                setFormData({
                    title: "",
                    type: "PERCENTAGE",
                    value: "",
                    category: "REGULAR",
                    startDate: "",
                    endDate: "",
                    bannerUrl: "",
                    description: "",
                    isExclusive: false,
                    showOnHome: true
                })
                setSelectedProducts([])
                setProductStocks({})
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to process promotion")
            }
        } catch (error) {
            toast.error("Network error")
        }
    }

    const handleDelete = async (id: string) => {
        if (!id || id === "undefined") {
            toast.error("Invalid promotion ID")
            return
        }
        if (!confirm("Are you sure you want to delete this promotion?")) return

        try {
            const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Promotion deleted")
                fetchPromotions()
            }
        } catch (error) {
            toast.error("Delete failed")
        }
    }

    const handleToggleActive = async (id: string, current: boolean) => {
        if (!id || id === "undefined" || id === "[object Object]") {
            toast.error("Invalid promotion ID")
            return
        }
        try {
            const res = await fetch(`/api/promotions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !current })
            })
            if (res.ok) {
                toast.success(current ? "Promotion paused" : "Promotion activated")
                fetchPromotions()
            }
        } catch (error) {
            toast.error("Operation failed")
        }
    }

    const handleEdit = (promo: any) => {
        if (!promo.id || promo.id === "undefined" || typeof promo.id !== 'string') {
            console.error("Promo ID missing or invalid:", promo)
            toast.error("Promotion missing a valid unique identifier")
            return
        }

        try {
            const safeDate = (dateStr: any) => {
                if (!dateStr) return ""
                try {
                    const d = new Date(dateStr)
                    if (isNaN(d.getTime())) return ""
                    return d.toISOString().slice(0, 16)
                } catch { return "" }
            }

            setFormData({
                title: promo.title || "",
                type: promo.type || "PERCENTAGE",
                value: promo.value ? promo.value.toString() : "",
                category: promo.category || "REGULAR",
                startDate: safeDate(promo.startDate),
                endDate: safeDate(promo.endDate),
                bannerUrl: promo.bannerUrl || "",
                description: promo.description || "",
                isExclusive: !!promo.isExclusive,
                showOnHome: promo.showOnHome !== undefined ? !!promo.showOnHome : true
            })

            const productIds = (promo.products?.map((p: any) => p.productId || p.id) || []).filter(Boolean)
            setSelectedProducts(productIds)

            const stocks: Record<string, string> = {}
            promo.products?.forEach((p: any) => {
                const pid = p.productId || p.id
                if (pid && p.saleStock !== null && p.saleStock !== undefined) {
                    stocks[pid] = p.saleStock.toString()
                }
            })
            setProductStocks(stocks)

            setEditingId(promo.id)
            setIsModalOpen(true)
        } catch (error) {
            console.error("Error setting up edit form:", error)
            toast.error("Failed to prepare edit form")
        }
    }

    const openCreateModal = () => {
        setEditingId(null)
        setFormData({
            title: "",
            type: "PERCENTAGE",
            value: "",
            category: "REGULAR",
            startDate: "",
            endDate: "",
            bannerUrl: "",
            description: "",
            isExclusive: false,
            showOnHome: true
        })
        setSelectedProducts([])
        setProductStocks({})
        setIsModalOpen(true)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black italic uppercase tracking-widest text-muted-foreground">Automated Promotions</h2>
                <Button 
                    onClick={openCreateModal}
                    className="h-8 px-4 rounded-lg bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[9px] gap-2"
                >
                    <Plus size={14} />
                    CREATE PROMOTION
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promo) => (
                    <Card key={promo.id} className="rounded-2xl border-border bg-card overflow-hidden group hover:border-primary/50 transition-all">
                        <div className={cn(
                            "p-1 text-[8px] font-black uppercase text-center text-white",
                            promo.category === 'FLASH_SALE' ? 'bg-rose-600' : 
                            promo.category === 'DAILY_DEAL' ? 'bg-amber-500' : 
                            promo.category === 'SEASONAL' ? 'bg-purple-600' :
                            promo.category === 'EXCLUSIVE' ? 'bg-emerald-600' :
                            'bg-blue-600'
                        )}>
                            {promo.category.replace('_', ' ')}
                            {promo.isExclusive && " | EXCLUSIVE"}
                        </div>
                        <CardContent className="p-5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="text-sm font-black uppercase tracking-tight italic">{promo.title}</h3>
                                    {promo.showOnHome && <span className="text-[7px] font-bold text-primary uppercase tracking-widest">Displaying on Home</span>}
                                </div>
                                <div className="text-xl font-black text-primary italic">
                                    {promo.type === 'PERCENTAGE' ? `-${promo.value}%` : `-$${promo.value}`}
                                </div>
                            </div>
                            
                            {promo.bannerUrl && (
                                <div className="w-full aspect-[21/9] rounded-lg overflow-hidden relative grayscale hover:grayscale-0 transition-all border border-border">
                                    <img src={promo.bannerUrl} alt="" className="object-cover w-full h-full" />
                                </div>
                            )}

                            <div className="flex flex-col gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-primary" />
                                    <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Smartphone size={12} className="text-primary" />
                                    <span>{promo.products?.length || 0} Products Targeted</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
                                <button 
                                    onClick={() => handleToggleActive(promo.id, promo.isActive)}
                                    className={cn(
                                        "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                        promo.isActive ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                                    )}
                                >
                                    {promo.isActive ? "Live" : "Ended / Paused"}
                                </button>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEdit(promo)
                                        }}
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                                    >
                                        <Edit2 size={12} />
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(promo.id)}
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-7 w-7 text-red-500"
                                    >
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 opacity-50 bg-muted/30 rounded-3xl border border-dashed border-border">
                        <Tag size={48} className="text-muted-foreground" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No active promotions found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-3xl bg-card border border-border rounded-[2rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
                                <XCircle size={24} />
                            </button>

                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-foreground">
                                {editingId ? 'UPDATE' : 'NEW'} <span className="text-primary italic">PHASE</span> PROMOTION
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">CAMPAIGN TITLE</label>
                                        <input 
                                            required
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none transition-all"
                                            placeholder="e.g. End of Year Sale"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">PROMO CATEGORY</label>
                                        <select 
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="REGULAR">REGULAR DISCOUNT</option>
                                            <option value="FLASH_SALE">FLASH SALE (PRIORITY 10)</option>
                                            <option value="SEASONAL">SEASONAL CAMPAIGN (PRIORITY 5)</option>
                                            <option value="DAILY_DEAL">DAILY DEAL (PRIORITY 3)</option>
                                            <option value="EXCLUSIVE">WEBSITE EXCLUSIVE (PRIORITY 1)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">BANNER MEDIA (PASTE OR UPLOAD)</label>
                                        <div 
                                            onPaste={handlePaste}
                                            className="relative group h-32 rounded-2xl bg-muted/40 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                                            onClick={() => document.getElementById('banner-upload')?.click()}
                                        >
                                            {formData.bannerUrl ? (
                                                <>
                                                    <img src={formData.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace Banner</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Click to upload or Paste Image</span>
                                                </>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                                                    <Zap className="text-primary animate-pulse" size={24} />
                                                </div>
                                            )}
                                            <input 
                                                id="banner-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">DESCRIPTION</label>
                                        <input 
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none transition-all"
                                            placeholder="Campaign brief..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">VALUE TYPE</label>
                                        <select 
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="PERCENTAGE">PERCENTAGE (%)</option>
                                            <option value="FIXED">FIXED AMOUNT ($)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">DISCOUNT VALUE</label>
                                        <input 
                                            required
                                            type="number"
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none"
                                            placeholder="e.g. 20"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">START TIMELINE</label>
                                        <input 
                                            required
                                            type="datetime-local"
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">END TIMELINE</label>
                                        <input 
                                            required
                                            type="datetime-local"
                                            className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-6 mt-2 ml-1">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox"
                                                checked={formData.isExclusive}
                                                onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                                                className="w-5 h-5 rounded-lg accent-primary"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Exclusive</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox"
                                                checked={formData.showOnHome}
                                                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                                className="w-5 h-5 rounded-lg accent-primary"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Show On Home</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">SELECT TARGET HARDWARE</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-4 bg-muted/30 rounded-2xl border border-border no-scrollbar">
                                        {products.map(product => (
                                            <div 
                                                key={product.id}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 transition-all flex flex-col gap-3 group relative overflow-hidden",
                                                    selectedProducts.includes(product.id) 
                                                        ? "border-primary bg-primary/5" 
                                                        : "border-transparent bg-background hover:border-border"
                                                )}
                                            >
                                                <div 
                                                    className="flex items-center justify-between cursor-pointer"
                                                    onClick={() => {
                                                        if (selectedProducts.includes(product.id)) {
                                                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                                                            const newStocks = { ...productStocks }
                                                            delete newStocks[product.id]
                                                            setProductStocks(newStocks)
                                                        } else {
                                                            setSelectedProducts([...selectedProducts, product.id])
                                                        }
                                                    }}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{product.name}</span>
                                                        <span className="text-[8px] font-bold text-muted-foreground">${product.price}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedProducts.includes(product.id) ? "border-primary bg-primary" : "border-muted-foreground/30"
                                                    )}>
                                                        {selectedProducts.includes(product.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>

                                                {selectedProducts.includes(product.id) && (
                                                    <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-300">
                                                        <label className="text-[7px] font-black uppercase tracking-widest text-primary/60 ml-0.5">Sale Stock (Optional)</label>
                                                        <input 
                                                            type="number"
                                                            placeholder="Unlimited"
                                                            className="h-8 bg-white/50 border border-primary/20 rounded-lg px-2 text-[9px] font-bold focus:border-primary outline-none"
                                                            value={productStocks[product.id] || ""}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => setProductStocks({ ...productStocks, [product.id]: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase text-center mt-1">
                                        {selectedProducts.length} Hardware Units Selected for Synchronization
                                    </p>
                                </div>

                                <Button 
                                    type="submit"
                                    className="h-16 w-full mt-4 bg-primary text-white font-black italic tracking-widest uppercase text-sm rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    COMMIT PROMOTION REGISTRY
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
