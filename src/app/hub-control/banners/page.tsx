"use client"

import React, { useState, useEffect } from "react"
import { 
    Plus, Trash2, Edit2, MoveUp, MoveDown, 
    Image as ImageIcon, Link as LinkIcon, 
    Eye, EyeOff, Save, X, Zap, 
    ChevronUp, ChevronDown, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

const LAYOUT_STYLES = [
    { id: 'HERO', name: 'FULL DEPTH HERO', icon: <ChevronUp className="rotate-90" size={14} />, desc: 'Large cinematic immersive layout' },
    { id: 'SPLIT', name: 'SIDE SPLIT', icon: <Plus size={14} />, desc: 'Compact 50/50 content-media split' }
]

export default function BannerManager() {
    const [banners, setBanners] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [productList, setProductList] = useState<any[]>([])

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        imageUrl: "",
        imageUrl2: "",
        link: "",
        discountCode: "",
        isActive: true,
        order: 0,
        layout: "HERO",
        buttonText: "EXPLORE NOW",
        primaryColor: "#7C3AED"
    })

    const fetchBanners = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers: any = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch("/api/banner?all=true", { headers })
            if (res.ok) {
                const data = await res.json()
                setBanners(data)
            }
        } catch (error) {
            toast.error("Failed to sync banners")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products")
            if (res.ok) {
                const data = await res.json()
                setProductList(Array.isArray(data) ? data : [])
            }
        } catch (e) {
            console.error("Products catalog sync failed")
        }
    }

    useEffect(() => {
        fetchBanners()
        fetchProducts()
    }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'imageUrl' | 'imageUrl2' = 'imageUrl') => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const toastId = toast.loading("Uploading asset...")

        try {
            const upData = new FormData()
            upData.append('file', file)

            const res = await fetch("/api/upload", { method: "POST", body: upData })
            const data = await res.json()
            
            if (data.success) {
                setFormData(prev => ({ ...prev, [fieldName]: data.urls[0] }))
                toast.success("Asset synchronized", { id: toastId })
            } else {
                throw new Error(data.error)
            }
        } catch (error: any) {
            toast.error(error.message || "Upload failed", { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.title || !formData.imageUrl) {
            toast.error("MISSING ASSETS: Title and Primary Image are required.")
            return
        }

        const toastId = toast.loading("Publishing changes to production...")
        try {
            const res = await fetch("/api/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingBanner?.id,
                    ...formData,
                    order: editingBanner ? formData.order : banners.length
                })
            })

            if (res.ok) {
                toast.success(editingBanner ? "BANNER UPDATED" : "PUBLISHED SUCCESSFULLY", { id: toastId })
                setIsModalOpen(false)
                setEditingBanner(null)
                fetchBanners()
                setFormData({
                    title: "",
                    subtitle: "",
                    imageUrl: "",
                    imageUrl2: "",
                    link: "",
                    discountCode: "",
                    isActive: true,
                    order: 0,
                    layout: "HERO",
                    buttonText: "EXPLORE NOW",
                    primaryColor: "#7C3AED"
                })
            } else {
                const errData = await res.json().catch(() => ({}))
                console.error("Sync Failed:", errData)
                toast.error(`PUBLISH FAILED: ${errData.error || 'Check admin permissions'}`, { id: toastId })
            }
        } catch (error: any) {
            console.error("Submission error:", error)
            toast.error("CONNECTION ERROR: Please try again.", { id: toastId })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Confirm asset deletion?")) return
        try {
            const res = await fetch(`/api/banner?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Asset Purged")
                fetchBanners()
            }
        } catch (error) {
            toast.error("Deletion failed")
        }
    }

    const handleToggleActive = async (banner: any) => {
        try {
            const res = await fetch("/api/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: banner.id, isActive: !banner.isActive })
            })
            if (res.ok) {
                toast.success(banner.isActive ? "Deactivated" : "Activated")
                fetchBanners()
            }
        } catch (error) {
            toast.error("Operation failed")
        }
    }

    const reorderBanner = async (index: number, direction: 'UP' | 'DOWN') => {
        const newBanners = [...banners]
        const targetIndex = direction === 'UP' ? index - 1 : index + 1
        
        if (targetIndex < 0 || targetIndex >= banners.length) return

        const temp = newBanners[index]
        newBanners[index] = newBanners[targetIndex]
        newBanners[targetIndex] = temp

        // Update orders in DB
        const updates = newBanners.map((b, i) => 
            fetch("/api/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: b.id, order: i })
            })
        )

        try {
            await Promise.all(updates)
            fetchBanners()
            toast.success("Banner Configuration Updated")
        } catch (error) {
            toast.error("Failed to save order")
        }
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black  tracking-tighter uppercase text-foreground">Banner Management</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Control the visual highlights of the interface.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Production Live</span>
                    </div>
                    <Button 
                        onClick={() => {
                            setEditingBanner(null)
                            setFormData({
                                title: "",
                                subtitle: "",
                                imageUrl: "",
                                imageUrl2: "",
                                link: "",
                                discountCode: "",
                                isActive: true,
                                order: banners.length,
                                layout: "HERO",
                                buttonText: "EXPLORE NOW",
                                primaryColor: "#7C3AED"
                            })
                            setIsModalOpen(true)
                        }}
                        className="h-12 px-8 rounded-2xl bg-primary text-white font-black  tracking-widest uppercase text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Plus size={18} />
                        CREATE NEW BANNER
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {banners.map((banner, index) => (
                        <motion.div
                            key={banner.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative"
                        >
                            <Card className={cn(
                                "rounded-[2.5rem] border-border bg-card overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500",
                                !banner.isActive && "opacity-60 grayscale scale-[0.98]"
                            )}>
                                <div className="aspect-[21/9] relative bg-muted/30 overflow-hidden">
                                   {banner.imageUrl ? (
                                       <img src={banner.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                   ) : (
                                       <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground opacity-20">
                                           <ImageIcon size={48} />
                                           <span className="text-[10px] font-black uppercase tracking-widest">No image selected</span>
                                       </div>
                                   )}
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-primary/20 text-white border-white/20 text-[7px] font-black tracking-widest uppercase">
                                                {banner.layout || 'HERO'}
                                            </Badge>
                                            <Badge variant="outline" className="bg-white/10 text-white/60 border-white/10 text-[7px] font-black tracking-widest uppercase">
                                                ORD: {index + 1}
                                            </Badge>
                                        </div>
                                        <h3 className="text-2xl font-black text-white  uppercase tracking-tighter leading-none">{banner.title}</h3>
                                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest mt-2">{banner.subtitle}</p>
                                   </div>
                                   
                                   <div className="absolute top-6 left-6 z-10 flex gap-2">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full animate-pulse",
                                            banner.isActive ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500"
                                        )} />
                                   </div>
                                </div>

                                <CardContent className="p-6 flex items-center justify-between border-t border-border/10">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => reorderBanner(index, 'UP')}
                                            disabled={index === 0}
                                            className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-all"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button 
                                            onClick={() => reorderBanner(index, 'DOWN')}
                                            disabled={index === banners.length - 1}
                                            className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-all"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleToggleActive(banner)}
                                            className={cn("h-10 w-10 rounded-xl", banner.isActive ? "text-emerald-500 hover:bg-emerald-50/50" : "text-amber-500 hover:bg-amber-50/50")}
                                        >
                                            {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => {
                                                setEditingBanner(banner)
                                                setFormData({
                                                    title: banner.title,
                                                    subtitle: banner.subtitle,
                                                    imageUrl: banner.imageUrl,
                                                    imageUrl2: banner.imageUrl2 || "",
                                                    link: banner.link,
                                                    discountCode: banner.discountCode,
                                                    isActive: banner.isActive,
                                                    order: banner.order,
                                                    layout: banner.layout || "HERO",
                                                    buttonText: banner.buttonText || "EXPLORE NOW",
                                                    primaryColor: banner.primaryColor || "#7C3AED"
                                                })
                                                setIsModalOpen(true)
                                            }}
                                            className="h-10 w-10 rounded-xl text-blue-500 hover:bg-blue-50/50"
                                        >
                                            <Edit2 size={18} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDelete(banner.id)}
                                            className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50/50"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:justify-end p-2 sm:p-4 lg:p-8 bg-slate-950/80 backdrop-blur-xl overflow-y-auto no-scrollbar">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-card border border-border rounded-3xl lg:rounded-[3.5rem] p-2 sm:p-4 w-full lg:max-w-[calc(100vw-360px)] xl:max-w-[1200px] shadow-2xl relative flex flex-col lg:flex-row gap-1"
                        >
                            {/* Editor Side */}
                            <div className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto max-h-[90vh] lg:max-h-[85vh] no-scrollbar">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors z-50"
                                >
                                    <X size={24} />
                                </button>

                                <h2 className="text-3xl font-black  tracking-tighter uppercase mb-2">
                                    {editingBanner ? 'UPDATE' : 'NEW'} <span className="text-primary">BANNER</span> CONFIGURATION
                                </h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-10 opacity-60">Enter banner details to update storefront visuals.</p>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                                    {/* Layout Selector */}
                                    <div className="flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Presentation Layout</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {LAYOUT_STYLES.map(style => (
                                                <button
                                                    key={style.id}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, layout: style.id})}
                                                    className={cn(
                                                        "flex flex-col gap-3 p-4 rounded-3xl border-2 text-left transition-all",
                                                        formData.layout === style.id 
                                                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                                                            : "border-border bg-muted/20 hover:border-primary/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                        formData.layout === style.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {style.icon}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest block">{style.name}</span>
                                                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{style.desc}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Banner Title</label>
                                                <Input 
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    placeholder="E.G. FLAGSHIP SUMMER LAUNCH"
                                                    className="h-16 bg-muted border border-border rounded-2xl px-6 text-xs font-black uppercase tracking-widest"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Sub-Narrative</label>
                                                <input 
                                                    required
                                                    className="h-14 bg-muted border border-border rounded-2xl px-6 text-sm font-bold focus:border-primary outline-none transition-all"
                                                    placeholder="e.g. UP TO 50% OFF"
                                                    value={formData.subtitle}
                                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">CTA Label</label>
                                                <input 
                                                    className="h-14 bg-muted border border-border rounded-2xl px-6 text-[10px] font-black tracking-[0.2em] uppercase focus:border-primary outline-none transition-all "
                                                    placeholder="e.g. SHOP NOW"
                                                    value={formData.buttonText}
                                                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Featured Image (Primary)</label>
                                                <div 
                                                    onClick={() => document.getElementById('file-up-1')?.click()}
                                                    className="relative aspect-video rounded-3xl bg-muted border-4 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                                                >
                                                    {formData.imageUrl ? (
                                                        <>
                                                            <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest ">Replace Asset 01</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon size={48} className="text-muted-foreground opacity-20 group-hover:opacity-40 transition-all" />
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Image Asset 01</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input id="file-up-1" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                                            </div>

                                            {formData.layout === 'SPLIT' && (
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Secondary Image (Split Layout)</label>
                                                    <div 
                                                        onClick={() => document.getElementById('file-up-2')?.click()}
                                                        className="relative aspect-video rounded-3xl bg-muted border-4 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                                                    >
                                                        {formData.imageUrl2 ? (
                                                            <>
                                                                <img src={formData.imageUrl2} alt="" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest ">Replace Asset 02</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ImageIcon size={48} className="text-muted-foreground opacity-20 group-hover:opacity-40 transition-all" />
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Image Asset 02</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input id="file-up-2" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl2')} />
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Accent HEX Code</label>
                                                    <div className="flex items-center gap-4 h-16 bg-muted border border-border rounded-2xl px-6">
                                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border/50 group">
                                                            <input 
                                                                type="color" 
                                                                value={formData.primaryColor || "#000000"} 
                                                                onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                                                                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none bg-transparent"
                                                            />
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            value={formData.primaryColor}
                                                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                                                            className="bg-transparent text-xs font-black uppercase w-full outline-none tracking-widest flex-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2 relative">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Navigation Link (URL / Target)</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                    <input 
                                                        className="h-14 w-full bg-muted border border-border rounded-2xl pl-14 pr-6 text-sm font-bold focus:border-primary outline-none transition-all"
                                                        placeholder="/products/lumina-zx"
                                                        value={formData.link}
                                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                    />
                                                </div>
                                                <select 
                                                    className="h-14 bg-muted border border-border rounded-2xl px-4 text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary cursor-pointer w-40"
                                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                    value={["/", "/products", "/products?promo=FLASH_SALE", "/hub-control"].includes(formData.link) || formData.link.startsWith('/products/') ? formData.link : "custom"}
                                                >
                                                    <option value="custom">-- PRESETS --</option>
                                                    <option value="/">HOME HUB</option>
                                                    <option value="/products">HARDWARE STORE</option>
                                                    <option value="/products?promo=FLASH_SALE">FLASH SALE</option>
                                                    <option value="/hub-control">DASHBOARD</option>
                                                    {productList.length > 0 && (
                                                        <>
                                                            <option disabled>──────────</option>
                                                            {productList.slice(0, 10).map(p => (
                                                                <option key={p.id} value={`/products/${p.id}`}>
                                                                    {p.name.length > 18 ? p.name.substring(0, 15) + '...' : p.name}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Promo Key (Optional)</label>
                                            <input 
                                                className="h-14 bg-muted border border-border rounded-2xl px-6 text-sm font-black tracking-widest uppercase focus:border-primary outline-none transition-all"
                                                placeholder="TITAN50"
                                                value={formData.discountCode}
                                                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <label htmlFor="active-check" className="text-[10px] font-black uppercase tracking-widest text-foreground cursor-pointer ">Enable Banner</label>
                                            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Mark this banner as active for current storefront.</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            id="active-check"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-6 h-6 rounded-lg accent-primary"
                                        />
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsModalOpen(false)}
                                            className="h-20 flex-1 rounded-3xl border-border bg-transparent text-muted-foreground font-black  tracking-widest uppercase text-xs hover:bg-muted/50 transition-all hover:text-foreground"
                                        >
                                            CANCEL CHANGES
                                        </Button>
                                        <Button 
                                            type="submit"
                                            className="h-20 flex-[2] rounded-3xl bg-primary text-white font-black  tracking-widest uppercase text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                                        >
                                            {editingBanner ? 'UPDATE BANNER' : 'PUBLISH BANNER'}
                                            <CheckCircle2 className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {/* High Fidelity Live Preview (Desktop Only) */}
                            <div className="hidden lg:flex w-[460px] bg-muted/30 border-l border-border rounded-r-[3.5rem] p-12 flex-col gap-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
                                
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Preview</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Real-time preview of current configuration</span>
                                </div>

                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-full flex flex-col gap-12">
                                        {formData.layout === 'HERO' ? (
                                            <div className="relative aspect-[16/10] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/50">
                                                {formData.imageUrl && <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />}
                                                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end text-white">
                                                    <h4 className="text-3xl font-black  uppercase leading-none mb-2">{formData.title || "TITLE"}</h4>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6">{formData.subtitle || "Subheading text goes here"}</p>
                                                    <div 
                                                        className="px-6 py-3 w-fit rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl"
                                                        style={{ backgroundColor: formData.primaryColor, color: '#fff' }}
                                                    >
                                                        {formData.buttonText}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                <div className="relative aspect-[16/10] bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-border/50">
                                                   <div className="h-full flex flex-row">
                                                       <div className="w-1/2 relative bg-muted/50">
                                                            {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" />}
                                                       </div>
                                                       <div className="w-1/2 relative bg-muted/30">
                                                            {formData.imageUrl2 && <img src={formData.imageUrl2} className="w-full h-full object-cover" alt="" />}
                                                            <div className="absolute inset-0 flex flex-col justify-center p-6 bg-black/20 text-white">
                                                                <h4 className="text-xl font-black  uppercase leading-tight line-clamp-2">{formData.title || "TITLE"}</h4>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-2 line-clamp-1">{formData.subtitle}</p>
                                                                <div 
                                                                    className="px-4 py-2 w-fit rounded-full text-[8px] font-black uppercase tracking-widest mt-4 shadow-lg"
                                                                    style={{ backgroundColor: formData.primaryColor }}
                                                                >
                                                                    {formData.buttonText}
                                                                </div>
                                                            </div>
                                                       </div>
                                                   </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-6">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Component Breakdown</span>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-card border border-border p-3 rounded-2xl">
                                                        <span className="text-[7px] font-black uppercase text-muted-foreground block mb-1">Color Contrast</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-md border border-border" style={{ backgroundColor: formData.primaryColor }} />
                                                            <span className="text-[9px] font-mono uppercase">{formData.primaryColor || '#FFF'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-card border border-border p-3 rounded-2xl">
                                                        <span className="text-[7px] font-black uppercase text-muted-foreground block mb-1">Button Text</span>
                                                        <span className="text-[9px] font-black uppercase truncate">{formData.buttonText}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
