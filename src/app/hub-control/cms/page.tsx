"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, Archive,
  Zap, ShieldCheck, Truck, Activity, Box, Tag, Star, Mail, Loader2, Maximize, Minimize, Smartphone, BarChart3, Package, Phone, Clock,
  Navigation, Search, Link as LinkIcon, MoveRight, Upload, Clipboard, ImageOff, FileText, Info as InfoIcon,
  LayoutDashboard as Layout, Image as ImageIcon, Settings as SettingsIcon, Share2, RefreshCw, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const ImageManager = ({ value, onChange, label, className }: { value: string, onChange: (val: string) => void, label: string, className?: string }) => {
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Invalid File: Only image files are allowed")
            return
        }
        
        setUploading(true)
        const toastId = toast.loading("Uploading asset...")
        try {
            const formData = new FormData()
            formData.append('file', file)
            
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            
            if (data.success && data.urls?.[0]) {
                onChange(data.urls[0])
                toast.success("Image Uploaded", { id: toastId })
            } else {
                throw new Error(data.error || "Upload failed")
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to upload image", { id: toastId })
        } finally {
            setUploading(false)
        }
    }

    const onPaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image")) {
                handleFile(items[i].getAsFile()!)
                return
            }
        }
    }

    return (
        <div className={cn("flex flex-col gap-3", className)} onPaste={onPaste}>
            <label className="text-[10px] font-black uppercase text-muted-foreground italic">{label}</label>
            <div 
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                }}
                className={cn(
                    "relative h-32 rounded-2xl border-2 border-dashed transition-all overflow-hidden group",
                    dragging ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:border-primary/40"
                )}
            >
                {value ? (
                    <div className="w-full h-full relative group/img">
                        <img 
                            src={
                                (value && typeof value === 'string' && value.trim().length > 0) ? (
                                    (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:')) ? value : `https://${value}`
                                ) : ""
                            } 
                            className="w-full h-full object-contain p-4" 
                            alt="Preview" 
                        />
                        
                        {/* Status Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm pointer-events-none">
                            <Upload className="text-white animate-bounce" size={20} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none font-outfit">Update Image</span>
                        </div>

                        {/* Delete Command - Higher Z-index and relative to stay above the input if necessary, but actually we use pointer-events-auto here */}
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onChange("");
                                toast.success("Image Removed");
                            }}
                            className="absolute top-4 right-4 z-[60] w-10 h-10 bg-destructive text-white rounded-xl shadow-2xl opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110 flex items-center justify-center cursor-pointer overflow-hidden border border-white/20"
                        >
                            <Trash2 size={16} />
                            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                        </button>

                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer z-50"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:opacity-80 transition-all relative">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                            <Upload size={18} />
                        </div>
                        <div className="flex flex-col items-center text-center px-6">
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none transition-all group-hover:tracking-[0.4em]">DRAG / CLICK / PASTE</span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] mt-1 italic">Standard Media Upload</span>
                        </div>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer z-50"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

type Section = "navigation" | "banners" | "categories" | "homepage" | "footer" | "support" | "pages"

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<Section>("navigation")
  const [data, setData] = useState<any>({
    settings: {}, banners: [], categories: [], testimonials: [], pages: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingLink, setEditingLink] = useState<number | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingFooterCluster, setEditingFooterCluster] = useState<any>(null)
  const [supportSettings, setSupportSettings] = useState<any>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cmsRes, pagesRes, prodRes, supportRes, configRes] = await Promise.all([
        fetch("/api/cms/homepage"),
        fetch("/api/cms/pages"),
        fetch("/api/products"),
        fetch("/api/settings/store"),
        fetch("/api/config/homepage")
      ])

      let finalizedData: any = { pages: [] }

      if (cmsRes.ok) {
        const cmsData = await cmsRes.json()
        finalizedData = { ...finalizedData, ...cmsData }
        
        // Normalize All Managed Assets
        const normalize = (field: any) => {
          if (!field) return []
          try { return typeof field === 'string' ? JSON.parse(field) : field }
          catch(e) { return [] }
        }

        const normalizeObj = (field: any) => {
          if (!field) return {}
          try { return typeof field === 'string' ? JSON.parse(field) : field }
          catch(e) { return {} }
        }

        // Merge with initial data to ensure we at least have empty arrays/objects
        finalizedData = { 
            settings: {},
            banners: [],
            categories: [], 
            testimonials: [],
            pages: [],
            ...finalizedData, 
            ...cmsData 
        }

        if (finalizedData.settings) {
          finalizedData.settings.navbarLinks = normalize(finalizedData.settings.navbarLinks).map((l: any) => ({
            ...l,
            subLinks: l.subLinks || l.sub || []
          }))
          finalizedData.settings.footerLinks = normalize(finalizedData.settings.footerLinks)
          finalizedData.settings.contactInfo = normalizeObj(finalizedData.settings.contactInfo)
          finalizedData.settings.socials = normalizeObj(finalizedData.settings.socials)
        }
      }

      if (pagesRes.ok) {
        finalizedData.pages = await pagesRes.json()
      }
      
      setData((prev: any) => ({ ...prev, ...finalizedData }))

      if (prodRes.ok) {
        const prods = await prodRes.json()
        setProducts(prods)
      }

      if (supportRes.ok) {
        const supData = await supportRes.json()
        setSupportSettings(supData)
      }

      if (configRes.ok) {
        const hpConfig = await configRes.json()
        setData((prev: any) => ({ ...prev, hpConfig }))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load storefront data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdate = async (section: string, payload: any) => {
    setSaving(true)
    
    // Strip UI-only metadata like _type to avoid database column errors
    const { _type, ...cleanedPayload } = payload
    
    // Serialize complex data for database storage
    let syncPayload = { ...cleanedPayload }
    if (section === "settings") {
      if (syncPayload.navbarLinks) syncPayload.navbarLinks = JSON.stringify(syncPayload.navbarLinks)
      if (syncPayload.footerLinks) syncPayload.footerLinks = JSON.stringify(syncPayload.footerLinks)
      if (syncPayload.contactInfo) syncPayload.contactInfo = JSON.stringify(syncPayload.contactInfo)
      if (syncPayload.socials) syncPayload.socials = JSON.stringify(syncPayload.socials)
    }

    if (section === "support") {
        try {
            const res = await fetch("/api/settings/store", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(syncPayload)
            })
            if (res.ok) {
                toast.success("Support Settings Updated")
                fetchData()
            } else {
                toast.error("Settings Update Failed")
            }
        } catch (e) {
            toast.error("Network Error")
        } finally {
            setSaving(false)
        }
        return
    }

    try {
      const res = await fetch(`/api/cms/${section}`, {
        method: section === "settings" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncPayload)
      })
      if (res.ok) {
        toast.success("Update Successful")
        setEditingBanner(null)
        fetchData()
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(`Update Failed: ${errData.error || "Unknown Error"}`)
      }
    } catch (error) {
      toast.error("Network Synchronization Error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (section: string, id: string) => {
    if (!confirm("Are you sure? This action is IRREVERSIBLE.")) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cms/${section}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success("Item Deleted")
        fetchData()
      }
    } catch (error) {
      toast.error("Deletion failed")
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async (section: string, payload: any) => {
    setSaving(true)
    try {
      // Serialize complex data objects for storage
      const preparedPayload = { ...payload };
      if (section === 'settings') {
        if (preparedPayload.navbarLinks) preparedPayload.navbarLinks = JSON.stringify(preparedPayload.navbarLinks);
        if (preparedPayload.footerLinks) preparedPayload.footerLinks = JSON.stringify(preparedPayload.footerLinks);
        if (preparedPayload.contactInfo) preparedPayload.contactInfo = JSON.stringify(preparedPayload.contactInfo);
        if (preparedPayload.socials) preparedPayload.socials = JSON.stringify(preparedPayload.socials);
      }

      const res = await fetch(`/api/cms/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedPayload)
      })
      if (res.ok) {
        toast.success("New Item Created")
        fetchData()
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(`Creation Failed: ${errData.error || "Operation Cancelled"}`)
      }
    } catch (error) {
        toast.error("Creation failed")
    } finally {
        setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-background" suppressHydrationWarning>
      <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl scale-150 animate-pulse" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Storefront Settings...</span>
    </div>
  )

  const tabs: {id: Section, icon: any}[] = [
    { id: "navigation", icon: Navigation },
    { id: "homepage", icon: Layout },
    { id: "banners", icon: Zap },
    { id: "footer", icon: Activity },
    { id: "support", icon: Mail },
    { id: "pages", icon: FileText },
  ]

  return (
    <div className="flex flex-col gap-12 max-w-[1400px] mx-auto p-4 md:p-8" suppressHydrationWarning>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            <Activity size={12} className="animate-pulse" />
            Content Management System
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase leading-none">Storefront <span className="text-primary italic">CMS</span></h1>
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-none mt-2">Manage <span className="text-foreground">Site Content and Layout</span>.</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="h-16 px-8 rounded-2xl border-primary/20 bg-card gap-4 font-black italic tracking-widest uppercase text-xs hover:border-primary transition-all shadow-2xl shadow-primary/5">
            REFRESH DATA <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
        </Button>
      </div>


      <div className="flex items-center gap-2 md:gap-3 bg-muted/20 p-2 rounded-3xl border border-border w-full md:w-fit shadow-inner overflow-x-auto no-scrollbar scroll-smooth flex-nowrap md:flex-wrap sticky top-4 z-50 backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 md:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 shrink-0",
              activeTab === tab.id ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon size={14} className={activeTab === tab.id ? "animate-bounce" : ""} />
            {tab.id}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-12"
        >
            {/* 1. NAVIGATION TAB */}
            {activeTab === "navigation" && (
                <div className="flex flex-col gap-10">
                    <Card className="rounded-[3rem] border-border shadow-2xl p-10 bg-card overflow-hidden relative">
                        <div className="flex flex-col gap-10">
                            {/* Brand Configuration */}
                            <div className="flex flex-col gap-8 p-8 bg-muted/30 border border-border/50 rounded-[2.5rem] shadow-inner mb-6">
                                <span className="text-[11px] font-black uppercase tracking-widest text-primary italic">Global Branding</span>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="flex flex-col gap-4">
                                        <ImageManager 
                                            label="Brand Logo"
                                            value={data.settings?.logoUrl || ""}
                                            onChange={(val) => setData({...data, settings: {...(data.settings || {}), logoUrl: val}})}
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Store Name</label>
                                            <div className="flex gap-4">
                                                <Input 
                                                    value={data.settings?.storeName || "SmartHub Electronics"} 
                                                    onChange={(e) => setData({
                                                        ...data, 
                                                        settings: {
                                                            ...(data.settings || {}), 
                                                            storeName: e.target.value
                                                        }
                                                    })}
                                                    className="h-14 bg-background border-border rounded-xl font-black text-xs flex-1"
                                                    placeholder="Enter Store Name..."
                                                />
                                                <div className="flex flex-col gap-2 min-w-[120px]">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">Show Name</span>
                                                    <div 
                                                        onClick={() => {
                                                            const newVal = data.settings?.showNameWithLogo === false ? true : false
                                                            setData({...data, settings: {...(data.settings || {}), showNameWithLogo: newVal}})
                                                        }}
                                                        className={cn(
                                                            "h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all",
                                                            data.settings?.showNameWithLogo !== false ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{data.settings?.showNameWithLogo !== false ? "ON" : "OFF"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button onClick={() => handleUpdate("settings", { 
                                            logoUrl: data.settings?.logoUrl,
                                            storeName: data.settings?.storeName,
                                            showNameWithLogo: data.settings?.showNameWithLogo !== false
                                        })} className="h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-auto" disabled={saving}>
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />} SYNC GLOBAL BRANDING
                                        </Button>
                                    </div>
                                </div>
                            </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Navigation Settings</h2>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest italic underline decoration-primary/30 underline-offset-4">Manage primary site menus</span>
                                </div>
                                <Button 
                                    onClick={() => {
                                        const newLinks = [...(data.settings.navbarLinks || []), { name: "NEW LINK", href: "/", subLinks: [] }]
                                        handleUpdate("settings", { navbarLinks: newLinks })
                                    }}
                                    className="h-14 rounded-2xl px-10 bg-primary text-white text-[10px] font-black italic uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> CREATE NEW LINK
                                </Button>
                            </div>

                            {/* Search Configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-muted/30 border border-border/50 rounded-[2.5rem] shadow-inner">
                                <div className="flex flex-col gap-4">
                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">Enable Search</span>
                                    <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border/50">
                                         <input 
                                            type="checkbox" 
                                            checked={data.settings?.searchShow !== false} 
                                            onChange={(e) => handleUpdate("settings", { searchShow: e.target.checked })}
                                            className="w-6 h-6 accent-primary cursor-pointer"
                                        />
                                        <span className="text-[10px] font-black uppercase italic">Active</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-4">
                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">Search Placeholder Text</span>
                                    <div className="flex gap-4">
                                        <Input 
                                            value={data.settings?.searchPlaceholder} 
                                            onChange={(e) => setData({
                                                ...data, 
                                                settings: {
                                                    ...(data.settings || {}), 
                                                    searchPlaceholder: e.target.value
                                                }
                                            })}
                                            className="h-14 bg-background border-border rounded-2xl font-black italic text-xs uppercase"
                                        />
                                        <Button onClick={() => handleUpdate("settings", { searchPlaceholder: data.settings?.searchPlaceholder })} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest italic text-[9px] shadow-xl shadow-primary/20">SAVE</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation List */}
                            <div className="flex flex-col gap-4">
                                {(data.settings.navbarLinks || []).map((link: any, idx: number) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-5 lg:p-6 bg-muted/10 border border-border rounded-[2rem] hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm"
                                    >
                                        <div className="flex items-center gap-5 lg:gap-6">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary text-white flex items-center justify-center text-xs lg:text-sm font-black italic shadow-lg shrink-0">{idx + 1}</div>
                                            <div className="flex flex-col min-w-0">
                                                <h4 className="text-base lg:text-lg font-black uppercase tracking-tighter italic leading-none truncate">{link.name || "UNNAMED"}</h4>
                                                <div className="flex items-center gap-3 mt-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground italic truncate">
                                                    <LinkIcon size={10} className="text-primary" /> {link.href}
                                                    <span className="opacity-20">•</span>
                                                    <Box size={10} className="text-primary" /> {link.subLinks?.length || 0} Sub-links
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center bg-card p-1 rounded-xl lg:rounded-2xl border border-border shrink-0">
                                                <Button 
                                                    onClick={() => {
                                                        const newLinks = [...data.settings.navbarLinks]
                                                        if (idx > 0) {
                                                            [newLinks[idx], newLinks[idx-1]] = [newLinks[idx-1], newLinks[idx]]
                                                            handleUpdate("settings", { navbarLinks: newLinks })
                                                        }
                                                    }}
                                                    variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl" disabled={idx === 0}
                                                >
                                                    <MoveUp size={14} />
                                                </Button>
                                                <Button 
                                                    onClick={() => {
                                                        const newLinks = [...data.settings.navbarLinks]
                                                        if (idx < newLinks.length - 1) {
                                                            [newLinks[idx], newLinks[idx+1]] = [newLinks[idx+1], newLinks[idx]]
                                                            handleUpdate("settings", { navbarLinks: newLinks })
                                                        }
                                                    }}
                                                    variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl" disabled={idx === data.settings.navbarLinks.length - 1}
                                                >
                                                    <MoveDown size={14} />
                                                </Button>
                                            </div>
                                            <Button 
                                                onClick={() => setEditingLink(idx)}
                                                className="h-10 lg:h-12 w-10 lg:w-12 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-all shadow-lg shrink-0"
                                                size="icon"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <button 
                                                onClick={() => {
                                                    const newLinks = data.settings.navbarLinks.filter((_: any, i: number) => i !== idx)
                                                    handleUpdate("settings", { navbarLinks: newLinks })
                                                }}
                                                className="w-10 h-10 lg:w-12 lg:h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all border border-destructive/20 shrink-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Button onClick={() => handleUpdate("settings", { navbarLinks: data.settings.navbarLinks })} className="h-20 rounded-[2rem] bg-foreground text-background font-black italic tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl mt-6 border-4 border-background ring-2 ring-foreground/10">
                                <Save size={24} className="mr-4" /> SAVE NAVIGATION SETTINGS
                            </Button>
                        </div>
                    </Card>

                    {/* GLOBAL NAVIGATION EDITOR - RIGHT SIDE SLIDE-OVER */}
                    <AnimatePresence>
                        {editingLink !== null && (
                            <div className="fixed inset-0 z-[1000] flex justify-end overflow-hidden">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => {
                                        handleUpdate("settings", { navbarLinks: data.settings.navbarLinks })
                                        setEditingLink(null)
                                        setSearchTerm("")
                                    }}
                                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                                />
                                <motion.div 
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                                    className="relative h-full w-full lg:max-w-[700px] bg-card border-l border-border shadow-[-80px_0_150px_rgba(0,0,0,0.6)] flex flex-col overflow-y-auto"
                                >
                                    {/* Drawer Header */}
                                    <div className="p-6 lg:p-8 border-b border-border bg-muted/30 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 shrink-0 sticky top-0 z-50 backdrop-blur-xl">
                                        <div className="flex items-center gap-4 lg:gap-5">
                                            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-[1.5rem] bg-primary text-white flex items-center justify-center text-xl lg:text-2xl font-black italic shadow-2xl shadow-primary/20">
                                                <Edit2 size={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Navigation Editor</span>
                                                <h4 className="text-xl lg:text-3xl font-black uppercase tracking-tighter italic leading-none mt-2 truncate max-w-[150px] lg:max-w-none">{data.settings.navbarLinks[editingLink]?.name || "UNNAMED"}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full lg:w-auto">
                                            <Button 
                                                onClick={() => handleUpdate("settings", { navbarLinks: data.settings.navbarLinks })}
                                                className="h-12 lg:h-14 flex-1 lg:flex-none px-5 lg:px-6 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all font-black uppercase text-[9px] lg:text-[10px] tracking-widest gap-2 shadow-sm"
                                            >
                                                <Save size={16} /> Sync
                                            </Button>
                                            <button 
                                                onClick={() => {
                                                    setEditingLink(null)
                                                    setSearchTerm("")
                                                }}
                                                className="w-12 h-12 lg:w-14 lg:h-14 bg-muted/20 border border-border rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-muted-foreground group"
                                            >
                                                <X size={24} className="group-hover:rotate-90 transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Link Configuration - High Density */}
                                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar flex flex-col gap-10 bg-muted/5">
                                        <div className="flex flex-col gap-8">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black uppercase text-primary italic flex items-center gap-2">
                                                    <Tag size={12} /> Link Label
                                                </label>
                                                <Input 
                                                    value={data.settings.navbarLinks[editingLink].name} 
                                                    onChange={(e) => {
                                                        const newLinks = [...data.settings.navbarLinks]
                                                        newLinks[editingLink].name = e.target.value
                                                        setData({...data, settings: {...data.settings, navbarLinks: newLinks}})
                                                    }}
                                                    className="h-16 border-border bg-background rounded-2xl text-lg font-black uppercase italic px-6 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-3 px-2">
                                                <label className="text-[10px] font-black uppercase text-primary italic flex items-center gap-2">
                                                    <LinkIcon size={12} /> Target URL Path
                                                </label>
                                                <Input 
                                                    value={data.settings.navbarLinks[editingLink].href} 
                                                    onChange={(e) => {
                                                        const newLinks = [...data.settings.navbarLinks]
                                                        let val = e.target.value
                                                        // Navigation Guard: Prevent common path duplication logic errors
                                                        if (val.includes("products/products/")) {
                                                            val = val.replace("products/products/", "products/")
                                                        }
                                                        newLinks[editingLink].href = val
                                                        setData({...data, settings: {...data.settings, navbarLinks: newLinks}})
                                                    }}
                                                    onPaste={(e) => e.stopPropagation()}
                                                    placeholder="/path/to/collection-or-product"
                                                    className="h-16 border-border bg-background rounded-2xl font-black italic text-sm px-6 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                                                />
                                            </div>

                                        {/* Sub-menu Items */}
                                        <div className="flex flex-col gap-6 bg-muted/20 p-8 rounded-[2.5rem] border border-border shadow-inner mt-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"><Box size={20} /></div>
                                                    <span className="text-[12px] font-black uppercase tracking-widest italic text-primary">Sub-menu Items</span>
                                                </div>
                                                <Button 
                                                    onClick={() => {
                                                        const newLinks = [...data.settings.navbarLinks]
                                                        newLinks[editingLink].subLinks = [...(newLinks[editingLink].subLinks || []), { name: "NEW LINK", href: "/" }]
                                                        setData({...data, settings: {...data.settings, navbarLinks: newLinks}})
                                                    }}
                                                    className="h-11 rounded-xl px-5 bg-primary text-white font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                                                >
                                                    <Plus size={16} className="mr-2" /> ADD LINK
                                                </Button>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                {(data.settings.navbarLinks[editingLink].subLinks || []).map((sub: any, sIdx: number) => (
                                                    <div key={sIdx} className="flex flex-col gap-3 p-4 bg-background dark:bg-slate-900 border border-border rounded-2xl shadow-sm hover:border-primary/40 transition-all relative">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[8px] font-black uppercase text-muted-foreground italic px-2">Display Label</label>
                                                            <Input 
                                                                value={sub.name}
                                                                onChange={(e) => {
                                                                    const newLinks = [...data.settings.navbarLinks]
                                                                    newLinks[editingLink].subLinks[sIdx].name = e.target.value
                                                                    setData({...data, settings: {...data.settings, navbarLinks: newLinks}})
                                                                }}
                                                                className="h-10 border-border text-[11px] font-black uppercase italic bg-muted/10 rounded-xl px-4 shadow-inner"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[8px] font-black uppercase text-muted-foreground italic px-2">Destination URL</label>
                                                            <div className="flex gap-2">
                                                                <Input 
                                                                    value={sub.href}
                                                                    onChange={(e) => {
                                                                        const newLinks = [...data.settings.navbarLinks]
                                                                        let val = e.target.value
                                                                        if (val.includes("products/products/")) {
                                                                            val = val.replace("products/products/", "products/")
                                                                        }
                                                                        newLinks[editingLink].subLinks[sIdx].href = val
                                                                        setData({...data, settings: {...data.settings, navbarLinks: newLinks}})
                                                                    }}
                                                                    onPaste={(e) => e.stopPropagation()}
                                                                    placeholder="/path/to/target"
                                                                    className="h-10 flex-1 border-border text-[11px] font-black italic bg-muted/10 rounded-xl px-4"
                                                                />
                                                                <button 
                                                                    onClick={() => {
                                                                        const newLinks = [...data.settings.navbarLinks]
                                                                        newLinks[editingLink].subLinks = newLinks[editingLink].subLinks.filter((_: any, i: number) => i !== sIdx)
                                                                        setData({...data, settings: {...data.settings, navbarLinks: newLinks}})
                                                                    }}
                                                                    className="w-10 h-10 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all border border-destructive/20"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(data.settings.navbarLinks[editingLink].subLinks || []).length === 0 && (
                                                    <div className="text-[10px] font-black uppercase opacity-30 text-center py-16 italic tracking-[0.3em] border-2 border-dashed border-border rounded-[2rem] bg-muted/5">No links defined for this menu</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                    {/* Drawer Footer */}
                                    <div className="p-8 border-t border-border bg-card flex shrink-0">
                                        <Button 
                                            onClick={() => {
                                                handleUpdate("settings", { navbarLinks: data.settings.navbarLinks })
                                                setEditingLink(null)
                                                setSearchTerm("")
                                            }}
                                            className="h-20 w-full rounded-3xl bg-foreground text-background font-black italic tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl border-4 border-background ring-2 ring-foreground/10"
                                        >
                                            SAVE CHANGES TO NAVIGATION
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            {activeTab === "banners" && (
                <div className="flex flex-col gap-8">
                    {/* Header: Clean & Accessible */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-bold tracking-tight">Home Banners</h2>
                            <p className="text-sm text-muted-foreground">Manage your storefront's primary visual content.</p>
                        </div>
                        <Button 
                            onClick={() => handleCreate("banners", { 
                                title: "", 
                                subtitle: "", 
                                imageUrl: "", 
                                mobileUrl: "",
                                buttonLink: "/products", 
                                layoutStyle: "merged",
                                useOverlay: false,
                                overlayOpacity: 0.5,
                                objectFit: "contain",
                                scalingMode: "fit-whole",
                                backgroundColor: "#000000",
                                titleColor: "white",
                                titleAlign: "center",
                                isActive: true, 
                                order: data?.banners?.length || 0
                            })} 
                            className="bg-primary text-white font-black h-14 px-8 rounded-2xl shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 uppercase italic tracking-widest text-[10px]"
                        >
                            <Plus size={18} /> Create New Banner
                        </Button>
                    </div>

                    {/* Banners Grid: Spacious & Professional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {(data?.banners || []).slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((slide: any) => (
                            <Card 
                                key={slide.id} 
                                className={cn(
                                    "group border-border overflow-hidden rounded-3xl hover:border-primary/40 transition-all duration-700 shadow-xl relative flex flex-col",
                                    !slide.isActive ? "bg-muted/10 border-dashed border-2" : "bg-card"
                                )}
                            >
                                <div className={cn("hidden md:block relative aspect-video bg-muted overflow-hidden", !slide.isActive && "opacity-40 grayscale")}>
                                     <img 
                                        src={
                                            (slide.imageUrl && typeof slide.imageUrl === 'string' && slide.imageUrl.trim().length > 0) ? (
                                                (slide.imageUrl.startsWith('http') || slide.imageUrl.startsWith('/') || slide.imageUrl.startsWith('data:')) ? slide.imageUrl : `https://${slide.imageUrl}`
                                            ) : "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                                        } 
                                        alt={slide.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        onError={(e: any) => {
                                            e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                                        }}
                                    />
                                    
                                    <div className="absolute top-4 right-4 z-20">
                                        <button 
                                            onClick={() => handleUpdate("banners", { ...slide, isActive: !slide.isActive })}
                                            className={cn(
                                                "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border-2 transition-all italic",
                                                slide.isActive 
                                                    ? "bg-emerald-500/90 text-white border-emerald-400/50 backdrop-blur-md hover:bg-emerald-600" 
                                                    : "bg-primary text-white border-primary/50 backdrop-blur-md hover:scale-105 animate-pulse"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {slide.isActive ? (
                                                    <><Activity size={10} className="animate-pulse" /> LIVE</>
                                                ) : (
                                                    <><Plus size={10} strokeWidth={4} /> RESTORE</>
                                                )}
                                            </div>
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 z-20">
                                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                                            <p className="text-white font-bold text-sm truncate">{slide.title || "Untitled Banner"}</p>
                                            <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium">Order: {slide.order + 1}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-1 shrink-0 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
                                         <button 
                                            disabled={slide.order === 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const current = slide.order;
                                                const prev = data.banners.find((b: any) => b.order === current - 1);
                                                if(prev) {
                                                    handleUpdate("banners", { ...slide, order: current - 1 });
                                                    handleUpdate("banners", { ...prev, order: current });
                                                }
                                            }}
                                            className="w-10 h-10 hover:bg-muted rounded-xl transition-colors text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                                        >
                                            <MoveUp size={16} />
                                        </button>
                                        <div className="w-[1px] h-4 bg-border/50 mx-0.5" />
                                        <button 
                                            disabled={slide.order === data.banners.length - 1}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const current = slide.order;
                                                const next = data.banners.find((b: any) => b.order === current + 1);
                                                if(next) {
                                                    handleUpdate("banners", { ...slide, order: current + 1 });
                                                    handleUpdate("banners", { ...next, order: current });
                                                }
                                            }}
                                            className="w-10 h-10 hover:bg-muted rounded-xl transition-colors text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                                        >
                                            <MoveDown size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            onClick={() => setEditingBanner(slide)}
                                            className="h-10 w-10 rounded-xl shrink-0"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        {!slide.isActive ? (
                                             <button 
                                                 onClick={() => handleUpdate("banners", { ...slide, isActive: true })} 
                                                 className="h-10 px-4 flex items-center gap-2 text-primary hover:bg-primary/5 rounded-xl transition-all font-black uppercase italic text-[10px] tracking-widest border border-primary/20 shrink-0 whitespace-nowrap"
                                             >
                                                 <Zap size={14} /> RESTORE
                                             </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleUpdate("banners", { ...slide, isActive: false })} 
                                                className="p-2.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-all shrink-0"
                                                title="Archive Banner"
                                            >
                                                <Archive size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete("banners", slide.id)} 
                                            className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all shrink-0"
                                            title="Permanently Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <AnimatePresence>
                        {editingBanner && (
                            <div className="fixed inset-0 z-[200] flex justify-end">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-background/40 backdrop-blur-sm" 
                                    onClick={() => setEditingBanner(null)}
                                />
                                <motion.div 
                                    initial={{ x: "100%", opacity: 0.5 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: "100%", opacity: 0.5 }}
                                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                    className="relative w-full lg:max-w-5xl h-full bg-card border-l border-border shadow-[-20px_0_50px_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col"
                                >
                                    {/* Header */}
                                    <div className="px-6 md:px-10 py-6 md:py-8 border-b border-border flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 shrink-0 bg-muted/20 sticky top-0 z-50 backdrop-blur-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/10 text-primary shadow-sm">
                                                <Layout size={22} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg lg:text-xl font-black italic uppercase tracking-tighter">Banner Configuration</h3>
                                                <p className="text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50 underline underline-offset-4 decoration-primary/30">Visual content sync</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
                                            <Button 
                                                onClick={() => {
                                                    handleUpdate("banners", editingBanner);
                                                    setEditingBanner(null);
                                                }}
                                                className="h-12 lg:h-14 flex-1 lg:flex-none px-6 lg:px-8 rounded-xl lg:rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                                            >
                                                <Save size={16} className="mr-2" /> SAVE CHANGES
                                            </Button>
                                            <button onClick={() => setEditingBanner(null)} className="h-12 w-12 lg:h-14 lg:w-14 hover:bg-muted border border-border rounded-xl lg:rounded-2xl flex items-center justify-center transition-all bg-card/40">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
                                        {/* Panoramic Preview with Clipping Guard */}
                                        <div className="w-full p-6 md:p-10 bg-black/40 border-b border-border flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">Panoramic Preview (1920x600 Guide)</span>
                                            </div>

                                            <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-border/20 bg-black group/preview">
                                                {editingBanner.imageUrl ? (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        {/* Full Image Dimmed Background (Shows what is cut off) */}
                                                        <img 
                                                            src={
                                                                (typeof editingBanner.imageUrl === 'string' && editingBanner.imageUrl.trim().length > 0) ? (
                                                                    (editingBanner.imageUrl.startsWith('http') || editingBanner.imageUrl.startsWith('/') || editingBanner.imageUrl.startsWith('data:')) 
                                                                    ? editingBanner.imageUrl 
                                                                    : `https://${editingBanner.imageUrl}`
                                                                ) : "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                                                            } 
                                                            className="w-full h-full object-contain opacity-20 blur-sm transition-all duration-700" 
                                                            alt="Cut-off Reference"
                                                        />

                                                        {/* Sharp Safe-Area Viewport (480px height crop) */}
                                                        <div className="absolute inset-x-0 h-[480px] border-y-2 border-primary/40 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center">
                                                            <div className="absolute top-2 left-4 z-50 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full opacity-80">Visible Horizon</div>
                                                            <img 
                                                                src={
                                                                    (typeof editingBanner.imageUrl === 'string' && editingBanner.imageUrl.trim().length > 0) ? (
                                                                        (editingBanner.imageUrl.startsWith('http') || editingBanner.imageUrl.startsWith('/') || editingBanner.imageUrl.startsWith('data:')) 
                                                                        ? editingBanner.imageUrl 
                                                                        : `https://${editingBanner.imageUrl}`
                                                                    ) : "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                                                                } 
                                                                className={`w-full h-full ${editingBanner.scalingMode === "fill" ? "object-cover" : "object-contain"} transition-all duration-700`}
                                                                alt="Visual Preview"
                                                            />
                                                            
                                                            {/* Hero Text Preview overlay within the safe area */}
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 gap-4">
                                                                {editingBanner.title && (
                                                                    <h4 className="font-black italic tracking-tighter uppercase text-xl sm:text-4xl leading-[0.9] max-w-sm text-white drop-shadow-2xl">
                                                                        {editingBanner.title}
                                                                    </h4>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted/20">
                                                        <ImageIcon className="w-16 h-16 text-muted-foreground/30 opacity-20" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* POSITIONAL SETTINGS (REMOVED) */}
                                        </div>

                                        {/* Configuration */}
                                        <div className="w-full p-6 md:p-10 bg-card">
                                            <div className="flex flex-col gap-12">
                                                <div className="space-y-8">
                                                    <div className="flex items-center gap-3 text-primary">
                                                        <Edit2 size={18} />
                                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Banner Content</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-8">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Headline Text</label>
                                                            <Input 
                                                                value={editingBanner.title} 
                                                                onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                                                                className="h-14 rounded-2xl border-border bg-muted/10 px-6 font-black italic uppercase tracking-widest text-sm"
                                                                placeholder="ENTER HEADLINE..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="flex items-center gap-3 text-primary">
                                                        <ImageIcon size={18} />
                                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Visual Assets</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-8">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="text-[10px] font-black uppercase opacity-40 italic">Hero Image</label>
                                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20">Recommended: 1920x600 px</span>
                                                        </div>
                                                        <ImageManager 
                                                            label=""
                                                            value={editingBanner.imageUrl}
                                                            onChange={(val: string) => setEditingBanner({...editingBanner, imageUrl: val})}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="flex items-center gap-3 text-primary">
                                                        <SettingsIcon size={18} />
                                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Configuration Settings</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 md:gap-8 p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-muted/10 border border-border shadow-inner">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Destination URL (Redirect)</label>
                                                            <Input 
                                                                value={editingBanner.buttonLink} 
                                                                onChange={(e) => setEditingBanner({...editingBanner, buttonLink: e.target.value})}
                                                                className="h-12 rounded-xl bg-card border-border px-6 text-xs font-bold"
                                                            />
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 lg:px-10 py-8 lg:py-10 border-t border-border bg-muted/30 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 shrink-0">
                                        <div className="flex-1 lg:flex-none" />
                                        <div className="flex flex-wrap items-center gap-4 lg:gap-6 w-full lg:w-auto">
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleUpdate("banners", { ...editingBanner, isActive: !editingBanner.isActive })}
                                                className={cn("h-12 lg:h-16 flex-1 px-5 lg:px-10 rounded-2xl lg:rounded-3xl font-black italic uppercase tracking-widest text-[8px] lg:text-[10px] border-4 transition-all shadow-xl", editingBanner.isActive ? "text-amber-500 border-amber-500/10 hover:bg-amber-500 hover:text-white" : "text-emerald-500 border-emerald-500/10 hover:bg-emerald-500 hover:text-white")}
                                            >
                                                {editingBanner.isActive ? "Hide Banner" : "Show Banner"}
                                            </Button>
                                            <button 
                                                onClick={() => {
                                                    handleDelete("banners", editingBanner.id)
                                                    setEditingBanner(null)
                                                }}
                                                className="w-12 h-12 lg:w-16 lg:h-16 bg-red-500/10 text-red-500 rounded-2xl lg:rounded-3xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 group shrink-0"
                                                title="DELETE BANNER"
                                            >
                                                <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                            <Button 
                                                onClick={() => {
                                                    handleUpdate("banners", editingBanner);
                                                    setEditingBanner(null);
                                                }}
                                                className="h-12 lg:h-16 flex-[2] lg:flex-1 rounded-2xl lg:rounded-3xl bg-foreground text-background font-black italic uppercase tracking-[0.15em] lg:tracking-[0.2em] text-[10px] lg:text-[12px] shadow-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
                                            >
                                                <Save size={20} className="mr-3 lg:mr-4" /> Save Banner
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            
            {/* CATEGORY MANAGEMENT */}
            {activeTab === "categories" && (
                <div className="flex flex-col gap-10">
                    <div className="flex items-center justify-between border-b border-border pb-8">
                        <div className="flex flex-col gap-2">
                             <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Store Categories</h2>
                             <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/30 underline-offset-4">Manage product categories and store navigation</span>
                        </div>
                        <Button onClick={() => handleCreate("categories", { name: "NEW CATEGORY", imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659899.png", isActive: true, order: data?.categories?.length || 0, redirectUrl: "" })} className="h-16 px-10 rounded-2xl gap-3 font-black italic tracking-widest uppercase text-xs shadow-2xl shadow-primary/30">
                            <Plus size={20} /> CREATE CATEGORY
                        </Button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            {(data?.categories || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((cat: any, idx: number) => (
                                <motion.div 
                                    key={cat.id || idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-6 bg-muted/10 border border-border rounded-[2.5rem] hover:border-primary/40 transition-all hover:bg-muted/20 flex items-center justify-between shadow-sm"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black italic">
                                                {idx + 1}
                                            </div>
                                            <div className="w-16 h-16 rounded-2xl bg-card p-3 border border-border shadow-inner flex items-center justify-center">
                                                <img 
                                                    src={cat.imageUrl} 
                                                    alt={cat.name} 
                                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-xl font-black uppercase tracking-tighter italic leading-none">{cat.name}</h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Link:</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic truncate max-w-[200px]">
                                                    {cat.redirectUrl || "Standard Category Link"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Order Control */}
                                        <div className="flex items-center bg-card/50 p-1.5 rounded-2xl border border-border">
                                            <Button 
                                                variant="ghost" size="icon" className="h-10 w-10 rounded-xl"
                                                onClick={() => {
                                                    const sorted = [...data.categories].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                                    if (idx > 0) {
                                                        const target = sorted[idx-1]
                                                        const current = sorted[idx]
                                                        const tempOrder = target.order || 0
                                                        target.order = current.order || 0
                                                        current.order = tempOrder
                                                        setData({ ...data, categories: [...sorted] })
                                                    }
                                                }}
                                                disabled={idx === 0}
                                            >
                                                <MoveUp size={16} />
                                            </Button>
                                            <Button 
                                                variant="ghost" size="icon" className="h-10 w-10 rounded-xl"
                                                onClick={() => {
                                                    const sorted = [...data.categories].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                                    if (idx < sorted.length - 1) {
                                                        const target = sorted[idx+1]
                                                        const current = sorted[idx]
                                                        const tempOrder = target.order || 0
                                                        target.order = current.order || 0
                                                        current.order = tempOrder
                                                        setData({ ...data, categories: [...sorted] })
                                                    }
                                                }}
                                                disabled={idx === (data.categories?.length - 1)}
                                            >
                                                <MoveDown size={16} />
                                            </Button>
                                        </div>

                                        <Button 
                                            onClick={() => setEditingCategory(cat)}
                                            className="h-12 px-6 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest italic"
                                        >
                                            <Edit2 size={14} className="mr-2" /> EDIT CATEGORY
                                        </Button>

                                        <button 
                                            onClick={() => handleDelete("categories", cat.id)}
                                            className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Button 
                            onClick={() => {
                                // Bulk Sync Logic for Categories
                                data.categories.forEach((cat: any) => {
                                    handleUpdate("categories", cat)
                                })
                            }}
                            className="h-20 rounded-[2.5rem] bg-foreground text-background font-black italic tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl mt-10 border-4 border-background ring-2 ring-foreground/10"
                        >
                            <Save size={24} className="mr-4" /> SAVE ALL CATEGORIES
                        </Button>
                    </div>

                    {/* CATEGORY EDITOR DRAWER */}
                    <AnimatePresence>
                        {editingCategory !== null && (
                            <div className="fixed inset-0 z-[1000] flex justify-end">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setEditingCategory(null)}
                                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                                />
                                <motion.div 
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                    className="relative h-full w-full max-w-[580px] bg-card border-l border-border shadow-[-40px_0_120px_rgba(0,0,0,0.5)] flex flex-col"
                                >
                                    <div className="p-10 border-b border-border bg-muted/30 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl">
                                                <Box size={32} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Category Settings</span>
                                                <h4 className="text-3xl font-black uppercase tracking-tighter italic leading-none mt-2">{editingCategory.name}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button 
                                                onClick={() => {
                                                    handleUpdate("categories", editingCategory);
                                                    setEditingCategory(null);
                                                }}
                                                className="h-14 px-8 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                                            >
                                                <Save size={16} className="mr-2" /> SAVE CHANGES
                                            </Button>
                                            <button onClick={() => setEditingCategory(null)} className="w-14 h-14 bg-muted/20 border border-border rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-12 space-y-12">
                                        {/* Identity Section */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4 text-primary">
                                                <SettingsIcon size={18} />
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Category Details</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-8 p-10 rounded-[2.5rem] bg-muted/20 border border-border shadow-inner">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Category Title (Public Name)</label>
                                                    <Input 
                                                        value={editingCategory.name} 
                                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                        className="h-14 rounded-2xl bg-card border-border px-8 font-black text-xs uppercase italic"
                                                    />
                                                </div>

                                                <ImageManager 
                                                    label="Category Icon"
                                                    value={editingCategory.imageUrl}
                                                    onChange={(val: string) => setEditingCategory({ ...editingCategory, imageUrl: val })}
                                                />

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Category Redirect Link</label>
                                                    <Input 
                                                        value={editingCategory.redirectUrl || ""} 
                                                        onChange={(e) => setEditingCategory({ ...editingCategory, redirectUrl: e.target.value })}
                                                        placeholder="/products?categories=..."
                                                        className="h-14 rounded-2xl bg-card border-border px-8 font-bold text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 border-t border-border bg-muted/30">
                                        <Button 
                                            onClick={() => {
                                                handleUpdate("categories", editingCategory);
                                                setEditingCategory(null);
                                            }}
                                            className="w-full h-20 rounded-[2.5rem] bg-foreground text-background font-black italic uppercase tracking-widest text-sm shadow-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-[1.02]"
                                        >
                                            <Save size={24} className="mr-4" /> SAVE CATEGORY SETTINGS
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            {/* 4. HOMEPAGE MATRIX MANAGEMENT */}
            {activeTab === "homepage" && (
                <div className="flex flex-col gap-10">
                    <div className="flex items-center justify-between border-b border-border pb-10">
                        <div className="flex flex-col gap-2">
                             <h2 className="text-4xl lg:text-[45px] font-black italic tracking-tighter uppercase leading-tight">Homepage <span className="text-primary italic">Layout</span></h2>
                             <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic underline decoration-primary/30 underline-offset-8">Orchestrate the primary storefront experience</span>
                        </div>
                        <Button 
                            onClick={() => {
                                const sections = data.hpConfig?.dynamicSections || []
                                const newSections = [...sections, { 
                                    id: Math.random().toString(36).substr(2, 9),
                                    type: "category",
                                    source: "",
                                    titleOverride: "NEW FEATURED SECTION",
                                    visible: true,
                                    order: sections.length + 1,
                                    limit: 8,
                                    sort: "newest"
                                }]
                                setData({ ...data, hpConfig: { ...data.hpConfig, dynamicSections: newSections } })
                                toast.success("Draft section initialized")
                            }}
                            className="h-20 px-12 rounded-[2rem] bg-primary text-white font-black italic uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all border-4 border-background ring-2 ring-primary/10 group"
                        >
                            <Plus size={24} className="mr-4 group-hover:rotate-90 transition-transform duration-500" /> ADD DYNAMIC SECTION
                        </Button>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="bg-muted/10 border border-border/60 rounded-[3rem] p-10 shadow-inner flex flex-col gap-8">
                            <div className="flex items-center gap-4 px-4">
                                <Activity size={18} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Standard System Sections</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {['newArrivals', 'discounted', 'featured'].map((key) => {
                                    const section = data.hpConfig?.[key] || { visible: true, title: key.toUpperCase(), order: 0 }
                                    return (
                                        <Card key={key} className="rounded-3xl border-border bg-card p-6 flex flex-col gap-6 group hover:border-primary/40 transition-all shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic leading-none">{key === 'newArrivals' ? 'Fresh Arrivals' : key === 'discounted' ? 'Daily Deals' : 'Best Sellers'}</span>
                                                    <h4 className="text-lg font-black uppercase tracking-tighter italic mt-2">{section.title}</h4>
                                                </div>
                                                <div 
                                                    onClick={() => {
                                                        const newVal = !section.visible
                                                        setData({...data, hpConfig: { ...data.hpConfig, [key]: { ...section, visible: newVal } }})
                                                    }}
                                                    className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all border shrink-0",
                                                        section.visible ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-muted border-border text-muted-foreground opacity-40"
                                                    )}
                                                >
                                                    {section.visible ? <Activity size={20} /> : <ImageIcon size={20} />}
                                                </div>
                                            </div>
                                            <div className="h-px bg-border/40" />
                                            <div className="flex flex-col gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase opacity-40 italic ml-1">Section Title</label>
                                                    <Input 
                                                        value={section.title}
                                                        onChange={(e) => setData({...data, hpConfig: { ...data.hpConfig, [key]: { ...section, title: e.target.value } }})}
                                                        className="h-10 bg-muted/20 border-border/50 rounded-xl font-bold italic uppercase text-[10px]"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase opacity-40 italic ml-1">Priority:</span>
                                                        <input 
                                                            type="number"
                                                            value={section.order}
                                                            onChange={(e) => setData({...data, hpConfig: { ...data.hpConfig, [key]: { ...section, order: parseInt(e.target.value) } }})}
                                                            className="w-12 h-8 bg-transparent text-[10px] font-black italic uppercase text-primary outline-none"
                                                        />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-30">Core System Module</span>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-10">
                            <div className="flex items-center gap-4 px-4 mt-8">
                                <Box size={18} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Dynamic Sub-Sections <span className="text-primary italic">({data.hpConfig?.dynamicSections?.length || 0})</span></span>
                            </div>

                            <div className="flex flex-col gap-6">
                                {(data.hpConfig?.dynamicSections || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((sec: any, idx: number) => (
                                    <motion.div 
                                        key={sec.id || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group p-8 lg:p-10 bg-card border-2 border-border/60 rounded-[3.5rem] hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                        
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-lg font-black italic shadow-2xl shrink-0 group-hover:rotate-6 transition-transform">
                                                    {idx + 1}
                                                </div>
                                                <div className={cn(
                                                    "w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl shadow-inner border border-border/20",
                                                    sec.type === "brand" ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                                                )}>
                                                    {sec.type === "brand" ? <Tag size={28} /> : <Box size={28} />}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                        sec.type === "brand" ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                                                    )}>Section by {sec.type}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic opacity-60">Source: {sec.source || 'ALL'}</span>
                                                </div>
                                                <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">{sec.titleOverride || "UNTITLED SECTION"}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">
                                                    Grid Layout • {sec.limit} Items Max • Sort: {sec.sort}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6 relative z-10 shrink-0">
                                            <div 
                                                onClick={() => {
                                                    const sections = [...data.hpConfig.dynamicSections]
                                                    sections[idx].visible = !sections[idx].visible
                                                    setData({...data, hpConfig: { ...data.hpConfig, dynamicSections: sections }})
                                                }}
                                                className={cn(
                                                    "h-16 px-10 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border-2",
                                                    sec.visible ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-muted border-border text-muted-foreground opacity-50 shadow-inner"
                                                )}
                                            >
                                                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{sec.visible ? "ACTIVE" : "HIDDEN"}</span>
                                            </div>

                                            <div className="flex items-center bg-muted/30 p-1.5 rounded-[2rem] border border-border/80 shadow-sm">
                                                <Button 
                                                    variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-card"
                                                    onClick={() => {
                                                        const sections = [...data.hpConfig.dynamicSections]
                                                        if (idx > 0) {
                                                            [sections[idx-1], sections[idx]] = [sections[idx], sections[idx-1]]
                                                            setData({...data, hpConfig: { ...data.hpConfig, dynamicSections: sections }})
                                                        }
                                                    }}
                                                    disabled={idx === 0}
                                                >
                                                    <MoveUp size={18} />
                                                </Button>
                                                <div className="w-px h-6 bg-border/40 mx-1" />
                                                <Button 
                                                    variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-card"
                                                    onClick={() => {
                                                        const sections = [...data.hpConfig.dynamicSections]
                                                        if (idx < sections.length - 1) {
                                                            [sections[idx+1], sections[idx]] = [sections[idx], sections[idx+1]]
                                                            setData({...data, hpConfig: { ...data.hpConfig, dynamicSections: sections }})
                                                        }
                                                    }}
                                                    disabled={idx === (data.hpConfig.dynamicSections?.length - 1)}
                                                >
                                                    <MoveDown size={18} />
                                                </Button>
                                            </div>

                                            <Button 
                                                onClick={() => setEditingLink({ payload: sec, index: idx })}
                                                className="h-16 w-16 rounded-[2rem] bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20 hover:scale-110 transition-all flex items-center justify-center"
                                            >
                                                <Edit2 size={24} strokeWidth={2.5} />
                                            </Button>

                                            <button 
                                                onClick={() => {
                                                    const sections = data.hpConfig.dynamicSections.filter((_: any, i: number) => i !== idx)
                                                    setData({ ...data, hpConfig: { ...data.hpConfig, dynamicSections: sections } })
                                                    toast.success("Section Draft Purged")
                                                }}
                                                className="w-16 h-16 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border-2 border-red-500/10 group/del"
                                            >
                                                <Trash2 size={24} className="group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <Button 
                            onClick={async () => {
                                setSaving(true)
                                try {
                                    const res = await fetch("/api/config/homepage", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(data.hpConfig)
                                    })
                                    if (res.ok) {
                                        toast.success("Homepage Configuration Synchronized")
                                        fetchData()
                                    } else {
                                        toast.error("Synchronization Failure")
                                    }
                                } catch (e) {
                                    toast.error("Network Topology Error")
                                } finally {
                                    setSaving(false)
                                }
                            }}
                            className="h-28 rounded-[3rem] bg-foreground text-background font-black italic tracking-[0.3em] uppercase text-lg hover:bg-primary hover:text-white transition-all shadow-[0_30px_60px_rgba(0,0,0,0.1)] mt-12 border-4 border-background ring-4 ring-foreground/5 relative group overflow-hidden"
                            disabled={saving}
                        >
                            <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                            {saving ? <Loader2 className="w-8 h-8 animate-spin mr-6" /> : <Save size={32} className="mr-6 group-hover:rotate-12 transition-transform" />} SYNC HOMEPAGE ARCHITECTURE
                        </Button>
                    </div>

                    {/* DYNAMIC SECTION EDITOR SLIDE-OVER - Reusing editingLink state but with extra payload */}
                    <AnimatePresence>
                        {editingLink && typeof editingLink === 'object' && editingLink.payload && (
                            <div className="fixed inset-0 z-[1000] flex justify-end">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setEditingLink(null)}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl"
                                />
                                <motion.div 
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 30, stiffness: 250 }}
                                    className="relative h-full w-full max-w-[640px] bg-card border-l-4 border-primary/20 shadow-[-100px_0_150px_rgba(0,0,0,0.4)] flex flex-col"
                                >
                                    <div className="p-12 border-b border-border bg-muted/40 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                                        <div className="flex flex-col gap-6 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.3em] italic">Section Orchestrator</div>
                                                <div className="h-px flex-1 bg-border/40" />
                                            </div>
                                            <h4 className="text-[40px] font-black uppercase tracking-tighter italic leading-none">{editingLink.payload.titleOverride || "UNNAMED SECTION"}</h4>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Configure dynamic content parameters and layout constraints</p>
                                        </div>
                                        <button 
                                            onClick={() => setEditingLink(null)}
                                            className="absolute top-12 right-12 w-14 h-14 bg-background border-2 border-border/50 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                                        {/* Core Configuration Matrix */}
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-4 text-primary">
                                                <SettingsIcon size={20} className="animate-spin-slow" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">Content Architecture</span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-10">
                                                {/* Title Matrix */}
                                                <div className="p-8 rounded-[2.5rem] bg-muted/30 border border-border/80 shadow-inner space-y-8">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Display Title Override</label>
                                                        <Input 
                                                            value={editingLink.payload.titleOverride} 
                                                            onChange={(e) => {
                                                                const payload = { ...editingLink.payload, titleOverride: e.target.value }
                                                                setEditingLink({ ...editingLink, payload })
                                                            }}
                                                            placeholder="ENTER SECTION TITLE..."
                                                            className="h-16 rounded-2xl bg-background border-2 border-border shadow-2xl px-8 font-black italic text-sm uppercase focus:ring-8 focus:ring-primary/10 transition-all"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Sub-Section Type</label>
                                                            <div className="flex items-center gap-2 p-2 bg-muted rounded-2xl border border-border">
                                                                <button 
                                                                    onClick={() => {
                                                                        const payload = { ...editingLink.payload, type: "category", source: "" }
                                                                        setEditingLink({ ...editingLink, payload })
                                                                    }}
                                                                    className={cn(
                                                                        "flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                                        editingLink.payload.type === "category" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-background"
                                                                    )}
                                                                >CATEGORY</button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const payload = { ...editingLink.payload, type: "brand", source: "" }
                                                                        setEditingLink({ ...editingLink, payload })
                                                                    }}
                                                                    className={cn(
                                                                        "flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                                        editingLink.payload.type === "brand" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-background"
                                                                    )}
                                                                >BRAND</button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Content Source</label>
                                                            <select 
                                                                value={editingLink.payload.source}
                                                                onChange={(e) => {
                                                                    const payload = { ...editingLink.payload, source: e.target.value }
                                                                    setEditingLink({ ...editingLink, payload })
                                                                }}
                                                                className="h-16 w-full rounded-2xl bg-background border-2 border-border px-6 font-black italic text-xs uppercase outline-none focus:ring-8 focus:ring-primary/10 transition-all appearance-none"
                                                            >
                                                                <option value="">SELECT SOURCE...</option>
                                                                {editingLink.payload.type === "category" ? (
                                                                    (data.categories || []).map((cat: any) => (
                                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                                    ))
                                                                ) : (
                                                                    Array.from(new Set(products.map(p => p.brand))).map((brand: string) => (
                                                                        <option key={brand} value={brand}>{brand}</option>
                                                                    ))
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Constraints Matrix */}
                                                <div className="p-8 rounded-[2.5rem] bg-muted/30 border border-border/80 shadow-inner space-y-10">
                                                    <div className="grid grid-cols-2 gap-10">
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Product Limit</label>
                                                            <div className="flex items-center gap-6 bg-background p-2 rounded-2xl border-2 border-border shadow-xl">
                                                                <button 
                                                                    onClick={() => {
                                                                        const payload = { ...editingLink.payload, limit: Math.max(4, editingLink.payload.limit - 4) }
                                                                        setEditingLink({ ...editingLink, payload })
                                                                    }}
                                                                    className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-black text-lg hover:bg-primary hover:text-white transition-all">-</button>
                                                                <span className="flex-1 text-center font-black text-lg italic">{editingLink.payload.limit}</span>
                                                                <button 
                                                                    onClick={() => {
                                                                        const payload = { ...editingLink.payload, limit: Math.min(24, editingLink.payload.limit + 4) }
                                                                        setEditingLink({ ...editingLink, payload })
                                                                    }}
                                                                    className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-black text-lg hover:bg-primary hover:text-white transition-all">+</button>
                                                            </div>
                                                            <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 italic ml-2 leading-tight">Displayed in grid format <br/>(Max 2 rows across breakpoints)</span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-2">Sorting Intelligence</label>
                                                            <div className="flex flex-col gap-3">
                                                                {['newest', 'price_asc', 'price_desc', 'stock_high'].map((rule) => (
                                                                    <button 
                                                                        key={rule}
                                                                        onClick={() => {
                                                                            const payload = { ...editingLink.payload, sort: rule }
                                                                            setEditingLink({ ...editingLink, payload })
                                                                        }}
                                                                        className={cn(
                                                                            "h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left px-6 border-2 flex items-center justify-between group/rule",
                                                                            editingLink.payload.sort === rule ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border/60 text-muted-foreground hover:border-primary/40"
                                                                        )}
                                                                    >
                                                                        {rule.replace('_', ' ')}
                                                                        {editingLink.payload.sort === rule && <Sparkles size={12} className="animate-pulse" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-12 border-t-4 border-border bg-muted/40 grid grid-cols-2 gap-8 sticky bottom-0">
                                        <Button 
                                            onClick={() => setEditingLink(null)}
                                            variant="outline"
                                            className="h-20 rounded-[2rem] border-2 border-border bg-background text-foreground font-black italic uppercase tracking-widest text-[10px] shadow-2xl hover:bg-muted"
                                        >
                                            CANCEL CHANGES
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                const sections = [...data.hpConfig.dynamicSections]
                                                sections[editingLink.index] = editingLink.payload
                                                setData({ ...data, hpConfig: { ...data.hpConfig, dynamicSections: sections } })
                                                setEditingLink(null)
                                                toast.success("Section Layout Updated")
                                            }}
                                            className="h-20 rounded-[2rem] bg-primary text-white font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
                                        >
                                            <Save size={20} className="mr-3" /> APPLY ARCHITECTURE
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            {activeTab === "footer" && data && (
                        <div className="flex flex-col gap-16 py-10">
                            {/* Footer Configuration Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/60 pb-12 px-8">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">Footer Content</h2>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50 italic">Manage the site's footer content and links</span>
                                </div>
                                <Button 
                                    onClick={() => handleUpdate("settings", data.settings)}
                                    className="h-16 px-10 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all border-4 border-background ring-2 ring-primary/10"
                                >
                                    <Save size={20} className="mr-3" /> SAVE FOOTER SETTINGS
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-8">
                                {/* Brand Information & Trust Group */}
                                <Card className="lg:col-span-5 rounded-[3rem] border-border bg-muted/20 p-10 flex flex-col gap-10 shadow-inner group overflow-hidden relative">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                                     
                                     <div className="flex items-center gap-4 text-primary relative z-10">
                                         <InfoIcon size={24} />
                                         <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">Brand Description</span>
                                     </div>
                                     
                                     <div className="flex flex-col gap-8 relative z-10">
                                         <div className="space-y-3">
                                             <label className="text-[9px] font-black uppercase opacity-40 italic ml-2">Company Description</label>
                                             <textarea 
                                                 value={data.settings.companyDescription}
                                                 onChange={(e) => setData({ ...data, settings: { ...data.settings, companyDescription: e.target.value } })}
                                                 className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-xs font-medium italic focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none shadow-sm"
                                                 placeholder="Enter company description..."
                                             />
                                         </div>

                                         <div className="grid grid-cols-1 gap-6">
                                             <div className="space-y-3">
                                                 <label className="text-[9px] font-black uppercase opacity-40 italic ml-2">Copyright Identity Information</label>
                                                 <Input 
                                                     value={data.settings.copyrightText}
                                                     onChange={(e) => setData({ ...data, settings: { ...data.settings, copyrightText: e.target.value } })}
                                                     className="h-12 bg-background border-border rounded-xl font-bold italic text-[11px] uppercase shadow-sm"
                                                 />
                                             </div>
                                             <div className="flex items-center justify-between p-5 bg-background border border-border rounded-2xl shadow-sm">
                                                 <div className="flex flex-col gap-0.5">
                                                     <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Trust Badges</span>
                                                     <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60 italic">Show Payment Methods</span>
                                                 </div>
                                                 <input 
                                                     type="checkbox"
                                                     checked={data.settings.showPaymentMethods}
                                                     onChange={(e) => setData({ ...data, settings: { ...data.settings, showPaymentMethods: e.target.checked } })}
                                                     className="w-6 h-6 rounded-lg accent-primary cursor-pointer shadow-md"
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                </Card>

                                {/* Link Group Management */}
                                <div className="lg:col-span-7 flex flex-col gap-8">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-[12px] font-black text-primary uppercase tracking-[0.3em] italic">Link Groups</span>
                                        <Button 
                                            onClick={() => {
                                                const clusters = [...(data.settings.footerLinks || [])]
                                                clusters.push({ title: "NEW LINK GROUP", links: [] })
                                                handleUpdate("settings", { footerLinks: clusters })
                                            }}
                                            className="h-12 px-6 rounded-xl bg-card border border-border text-foreground font-black italic uppercase tracking-widest text-[10px] hover:bg-muted transition-all shadow-sm"
                                        >
                                            <Plus size={16} className="mr-2" /> CREATE GROUP
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                                        {(data.settings.footerLinks || []).map((cluster: any, idx: number) => (
                                            <Card key={idx} className="rounded-[2.5rem] border-border bg-card p-8 flex flex-col gap-6 group hover:border-primary/40 transition-all shadow-xl shadow-black/5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                
                                                <div className="flex flex-col gap-2 relative z-10">
                                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">{cluster.title || "UNNAMED"}</h3>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">{cluster.links?.length || 0} LINKS ACTIVE</span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-auto relative z-10">
                                                    <Button 
                                                        onClick={() => setEditingFooterCluster({ idx, ...cluster })}
                                                        size="icon"
                                                        className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>

                                                    <button 
                                                        onClick={() => {
                                                            const newLinks = data.settings.footerLinks.filter((_: any, i: number) => i !== idx)
                                                            handleUpdate("settings", { footerLinks: newLinks })
                                                        }}
                                                        className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:scale-105"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                             </div>
                             <div className="space-y-12 mt-16 bg-muted/5 p-16 rounded-[4.5rem] border border-border/50 shadow-2xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                                 
                                 <div className="flex items-center gap-8 text-primary relative z-10">
                                     <div className="w-20 h-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 hover:rotate-6 transition-transform">
                                         <Share2 size={36} />
                                     </div>
                                     <div className="flex flex-col gap-2">
                                         <span className="text-sm font-black uppercase tracking-[0.4em] italic leading-none">Social Links</span>
                                         <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic leading-none">Configure your store's social network connections</span>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                     {["facebook", "instagram", "twitter", "tiktok"].map((social) => (
                                         <div key={social} className="p-12 rounded-[3.5rem] bg-card border border-border shadow-2xl hover:border-primary transition-all flex flex-col gap-8 group relative overflow-hidden h-full">
                                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                 <Share2 size={64} />
                                             </div>
                                             
                                             <div className="flex items-center gap-6 relative z-10">
                                                 <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary text-xl font-black uppercase shadow-inner group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                                     {social[0]}
                                                 </div>
                                                 <div className="flex flex-col">
                                                     <label className="text-[12px] font-black uppercase tracking-[0.2em] opacity-60 italic">{social}</label>
                                                     <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-30 italic mt-1">Direct Connection URL</span>
                                                 </div>
                                             </div>
                                             
                                             <Input 
                                                 value={data.settings.socials?.[social] || ""}
                                                 onChange={(e) => setData({
                                                     ...data,
                                                     settings: {
                                                         ...data.settings,
                                                         socials: { ...data.settings.socials, [social]: e.target.value }
                                                     }
                                                 })}
                                                 className="h-20 bg-muted/20 border-border focus:ring-8 focus:ring-primary/5 text-lg font-black italic tracking-wider px-8 rounded-3xl placeholder:opacity-20 uppercase relative z-10 transition-all shadow-inner border-2 focus:border-primary/40"
                                                 placeholder={`https://${social}.com/smarthub`}
                                             />
                                         </div>
                                     ))}
                                 </div>

                                 <div className="flex justify-end pt-8 relative z-10">
                                     <Button 
                                         onClick={() => handleUpdate("settings", { socials: data.settings.socials })}
                                         className="h-24 px-16 rounded-[2.5rem] bg-primary text-white font-black italic uppercase tracking-[0.3em] text-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all border-4 border-background ring-4 ring-primary/5"
                                         disabled={saving}
                                     >
                                         {saving ? <Loader2 size={24} className="animate-spin mr-4" /> : <Save size={24} className="mr-4" />} Save Socials
                                     </Button>
                                 </div>
                             </div>
                            <AnimatePresence>
                                {editingFooterCluster && (
                                    <div className="fixed inset-0 z-[1000] flex justify-end">
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                                            onClick={() => setEditingFooterCluster(null)}
                                        />
                                        <motion.div 
                                            initial={{ x: "100%" }}
                                            animate={{ x: 0 }}
                                            exit={{ x: "100%" }}
                                            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 1 }}
                                            className="relative h-full w-full max-w-[600px] bg-card border-l border-border shadow-[-80px_0_150px_rgba(0,0,0,0.6)] flex flex-col"
                                        >
                                            <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
                                                        <Layout size={24} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Group Settings</span>
                                                        <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none mt-2 truncate max-w-[200px]">{editingFooterCluster.title}</h4>
                                                    </div>
                                                </div>
                                                <button onClick={() => setEditingFooterCluster(null)} className="w-14 h-14 bg-muted/20 border border-border rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-muted-foreground group">
                                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-muted/5 custom-scrollbar">
                                                <div className="flex flex-col gap-4">
                                                    <label className="text-[10px] font-black uppercase text-primary italic flex items-center gap-2">
                                                        <Tag size={12} /> Group Title
                                                    </label>
                                                    <Input 
                                                        value={editingFooterCluster.title}
                                                        onChange={(e) => setEditingFooterCluster({ ...editingFooterCluster, title: e.target.value })}
                                                        className="h-16 border-border bg-background rounded-2xl text-lg font-black italic px-6 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-6 p-8 rounded-[3rem] bg-muted/20 border border-border shadow-inner mt-4">
                                                    <div className="flex items-center justify-between px-2">
                                                        <span className="text-[11px] font-black uppercase tracking-widest italic text-primary">Group Links</span>
                                                        <Button 
                                                            onClick={() => {
                                                                const newLinks = [...editingFooterCluster.links, { name: "NEW LINK", href: "/" }]
                                                                setEditingFooterCluster({ ...editingFooterCluster, links: newLinks })
                                                            }}
                                                            className="h-10 px-5 rounded-xl bg-primary text-white font-black italic uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20"
                                                        >
                                                            <Plus size={14} className="mr-2" /> Add Link Item
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-col gap-4">
                                                        {editingFooterCluster.links.map((link: any, lIdx: number) => (
                                                            <div key={lIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-background border border-border rounded-2xl shadow-sm hover:border-primary/40 transition-all group/link">
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[8px] font-black uppercase text-muted-foreground italic px-2">Link Label</label>
                                                                    <Input 
                                                                        value={link.name}
                                                                        onChange={(e) => {
                                                                            const newLinks = [...editingFooterCluster.links]
                                                                            newLinks[lIdx].name = e.target.value
                                                                            setEditingFooterCluster({ ...editingFooterCluster, links: newLinks })
                                                                        }}
                                                                        className="h-10 border-border text-[10px] font-black italic bg-muted/5 rounded-xl px-4"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[8px] font-black uppercase text-muted-foreground italic px-2">Destination URL</label>
                                                                    <div className="flex gap-2">
                                                                        <Input 
                                                                            value={link.href}
                                                                            onChange={(e) => {
                                                                                const newLinks = [...editingFooterCluster.links]
                                                                                newLinks[lIdx].href = e.target.value
                                                                                setEditingFooterCluster({ ...editingFooterCluster, links: newLinks })
                                                                            }}
                                                                            className="h-10 flex-1 border-border text-[10px] font-bold bg-muted/5 rounded-xl px-4"
                                                                        />
                                                                        <button 
                                                                            onClick={() => {
                                                                                const newLinks = editingFooterCluster.links.filter((_: any, i: number) => i !== lIdx)
                                                                                setEditingFooterCluster({ ...editingFooterCluster, links: newLinks })
                                                                            }}
                                                                            className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {editingFooterCluster.links.length === 0 && (
                                                            <div className="py-12 flex flex-col items-center gap-2 opacity-30">
                                                                <Activity size={32} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest italic">No Links Defined</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 border-t border-border bg-card flex shrink-0">
                                                <Button 
                                                    onClick={() => {
                                                        const newFooterLinks = [...data.settings.footerLinks]
                                                        newFooterLinks[editingFooterCluster.idx] = { 
                                                            title: editingFooterCluster.title, 
                                                            links: editingFooterCluster.links 
                                                        }
                                                        handleUpdate("settings", { footerLinks: newFooterLinks })
                                                        setEditingFooterCluster(null)
                                                    }}
                                                    className="h-20 w-full rounded-3xl bg-foreground text-background font-black italic tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl border-4 border-background ring-2 ring-foreground/10"
                                                >
                                                    SAVE GROUP SETTINGS
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 6. SITE PAGES MANAGEMENT */}
                    {activeTab === "pages" && (
                        <div className="flex flex-col gap-10">
                            <div className="flex items-center justify-between border-b border-border pb-8">
                                <div className="flex flex-col gap-2">
                                     <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Site Pages</h2>
                                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/30 underline-offset-4">Core legal and informational documents</span>
                                </div>
                                <Button 
                                    onClick={() => handleCreate("pages", { 
                                        title: "NEW PAGE", 
                                        slug: "new-page", 
                                        content: "PAGE CONTENT...", 
                                        status: "DRAFT" 
                                    })} 
                                    className="h-16 px-10 rounded-2xl gap-3 font-black italic tracking-widest uppercase text-xs shadow-2xl shadow-primary/30"
                                >
                                    <Plus size={20} /> CREATE PAGE
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(data?.pages || []).map((page: any, idx: number) => (
                                    <motion.div 
                                        key={page.id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-8 bg-muted/10 border border-border rounded-[2.5rem] hover:border-primary/40 transition-all hover:bg-muted/20 flex flex-col gap-6 shadow-sm relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Archive size={48} />
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", page.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500")} />
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{page.status}</span>
                                            </div>
                                            <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none truncate pr-12">{page.title}</h4>
                                            <span className="text-[10px] font-bold text-primary italic">/{page.slug}</span>
                                        </div>

                                        <div className="mt-auto flex items-center gap-3">
                                            <Button 
                                                onClick={() => setEditingCategory({ ...page, _type: 'page' })}
                                                size="icon"
                                                className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </Button>

                                            <button 
                                                onClick={() => handleDelete("pages", page.id)}
                                                className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "support" && data && supportSettings && (
                        <div className="flex flex-col gap-12">
                            {/* Support Channel Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border pb-10">
                                <div className="flex flex-col gap-2">
                                     <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Support Channels</h2>
                                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic underline decoration-primary/30 underline-offset-4">Physical and digital communication channels</span>
                                </div>
                                <Button 
                                    onClick={() => handleUpdate("support", supportSettings)}
                                    disabled={saving}
                                    className="h-16 px-10 rounded-2xl gap-3 font-black italic tracking-widest uppercase text-xs shadow-2xl shadow-primary/30"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save size={20} className="mr-2" />} SYNC CHANNELS
                                </Button>
                            </div>

                            <div className="space-y-16">
                                {/* 1. STORE CONTACT DETAILS */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 text-primary">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">Contact Information</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { id: "address", label: "Headquarters", icon: Navigation, placeholder: "ENTER HEADQUARTERS...", textarea: true },
                                            { id: "email", label: "Support Email", icon: Mail, placeholder: "SUPPORT@AGENT.NEXUS" },
                                            { id: "phone", label: "Support Phone", icon: Phone, placeholder: "+1 (888) HUB-SMART" },
                                            { id: "hours", label: "Business Hours", icon: Clock, placeholder: "MON-SUN 24/7", textarea: true },
                                        ].map((item: any) => (
                                            <div key={item.id} className="p-10 rounded-[2.5rem] bg-muted/10 border border-border hover:border-primary/40 transition-all flex flex-col gap-6 shadow-sm group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                        <item.icon size={24} />
                                                    </div>
                                                    <label className="text-[11px] font-black uppercase tracking-widest opacity-40 italic">{item.label}</label>
                                                </div>
                                                {item.textarea ? (
                                                    <textarea 
                                                        value={supportSettings[item.id] || ""} 
                                                        onChange={(e) => setSupportSettings({ ...supportSettings, [item.id]: e.target.value })}
                                                        className="w-full h-32 bg-background border border-border rounded-2xl px-6 py-5 text-xs font-bold uppercase italic shadow-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none custom-scrollbar leading-relaxed"
                                                        placeholder={item.placeholder}
                                                    />
                                                ) : (
                                                    <Input 
                                                        value={supportSettings[item.id] || ""} 
                                                        onChange={(e) => setSupportSettings({ ...supportSettings, [item.id]: e.target.value })}
                                                        className="h-16 border-border bg-background rounded-2xl px-6 font-bold italic text-xs shadow-sm placeholder:opacity-20"
                                                        placeholder={item.placeholder}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. SOCIAL ORCHESTRATION CROSS-LINKING */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 text-primary">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Zap size={18} />
                                        </div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">Social Links</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {["facebook", "instagram", "twitter", "tiktok"].map((social) => (
                                            <div key={social} className="p-8 rounded-[2.5rem] bg-card border border-border shadow-xl hover:border-primary/20 transition-all flex flex-col gap-6 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-primary text-xs font-black uppercase shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {social[0]}
                                                    </div>
                                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">{social} Link</label>
                                                </div>
                                                <Input 
                                                    value={data.settings.socials?.[social] || ""}
                                                    onChange={(e) => setData({
                                                        ...data,
                                                        settings: {
                                                            ...data.settings,
                                                            socials: { ...data.settings.socials, [social]: e.target.value }
                                                        }
                                                    })}
                                                    className="h-14 bg-muted/20 border-border focus:ring-2 focus:ring-primary/10 text-xs font-bold italic tracking-wider px-6 rounded-2xl placeholder:opacity-20"
                                                    placeholder={`https://${social}.com/your-brand`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center mt-12 pb-20">
                                        <Button 
                                            onClick={() => handleUpdate("settings", { socials: data.settings.socials })}
                                            className="h-14 px-10 rounded-2xl gap-3 font-black italic tracking-widest uppercase text-[10px] shadow-2xl shadow-primary/20"
                                        >
                                            <RefreshCw size={18} className="mr-2" /> SAVE SOCIALS
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
        </motion.div>
      </AnimatePresence>

      {/* PAGE EDITOR DRAWER */}
      <AnimatePresence>
          {editingCategory?._type === 'page' && (
               <div className="fixed inset-0 z-[1000] flex justify-end">
                  <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setEditingCategory(null)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                  />
                  <motion.div 
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 40, stiffness: 400 }}
                      className="relative h-full w-full lg:max-w-[800px] bg-card border-l border-border shadow-[-40px_0_120px_rgba(0,0,0,0.5)] flex flex-col overflow-y-auto"
                  >
                      <div className="p-6 md:p-10 border-b border-border bg-muted/30 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 sticky top-0 z-50 backdrop-blur-xl">
                          <div className="flex items-center gap-4 lg:gap-6">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl">
                                  <Archive size={28} />
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Page Settings</span>
                                  <h4 className="text-xl lg:text-3xl font-black uppercase tracking-tighter italic leading-none mt-2 truncate max-w-[200px] lg:max-w-none">{editingCategory.title}</h4>
                              </div>
                          </div>
                          <div className="flex items-center gap-3 w-full lg:w-auto">
                              <Button 
                                  onClick={() => {
                                      handleUpdate("pages", editingCategory);
                                      setEditingCategory(null);
                                  }}
                                  className="h-12 lg:h-14 flex-1 lg:flex-none px-6 lg:px-8 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                              >
                                  <Save size={16} className="mr-2" /> SAVE PAGE
                              </Button>
                              <button onClick={() => setEditingCategory(null)} className="w-12 h-12 lg:w-14 lg:h-14 bg-muted/20 border border-border rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                  <X size={24} />
                              </button>
                          </div>
                      </div>

                      <div className="flex-1 p-6 lg:p-12 space-y-10 lg:space-y-12">
                          {/* Page Status Editor: Moved to Top */}
                          <div className="flex items-center justify-between p-8 bg-slate-950 text-white rounded-[2rem] shadow-2xl border border-white/5 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex flex-col gap-1 relative z-10">
                                  <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Visibility Terminal</span>
                                  <span className="text-xs font-black uppercase italic tracking-tighter">Broadcast to Public Site?</span>
                              </div>
                              <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10 relative z-10">
                                  <button 
                                      onClick={() => setEditingCategory({...editingCategory, status: "PUBLISHED"})}
                                      className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all ${editingCategory.status === "PUBLISHED" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"}`}
                                  >
                                      PUBLISHED
                                  </button>
                                  <button 
                                      onClick={() => setEditingCategory({...editingCategory, status: "DRAFT"})}
                                      className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all ${editingCategory.status === "DRAFT" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"}`}
                                  >
                                      DRAFT
                                  </button>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                              <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase opacity-40 italic">Page Title</label>
                                   <Input 
                                       value={editingCategory.title} 
                                       onChange={(e) => setEditingCategory({...editingCategory, title: e.target.value})}
                                       className="h-12 border-border font-black text-sm uppercase italic"
                                   />
                               </div>
                               <div className="space-y-3">
                                   <label className="text-[10px] font-black uppercase opacity-40 italic">URL Slug</label>
                                   <Input 
                                       value={editingCategory.slug} 
                                       onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                                       className="h-12 border-border font-bold text-xs"
                                   />
                               </div>
                          </div>

                          <div className="space-y-3">
                               <div className="flex items-center justify-between mb-2">
                                   <label className="text-[10px] font-black uppercase opacity-40 italic">Narrative Content</label>
                                   <div className="flex gap-2">
                                       <span className="text-[8px] font-black uppercase tracking-widest opacity-20 italic">Draft Supported</span>
                                   </div>
                               </div>
                               <textarea 
                                   value={editingCategory.content} 
                                   onChange={(e) => setEditingCategory({...editingCategory, content: e.target.value})}
                                   className="w-full h-[400px] bg-muted/20 border border-border rounded-3xl p-10 text-xs font-medium focus:ring-1 focus:ring-primary outline-none custom-scrollbar leading-relaxed"
                                   placeholder="Enter content here..."
                               />
                           </div>

                          <div className="space-y-8 bg-muted/30 p-10 rounded-[2.5rem] border border-border shadow-inner">
                              <div className="flex items-center gap-3 text-primary">
                                  <Activity size={18} />
                                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Search Engine Optimization (SEO)</span>
                              </div>
                              <div className="grid grid-cols-1 gap-8">
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black uppercase opacity-40 italic">SEO Title</label>
                                      <Input 
                                          value={editingCategory.seoTitle || ""} 
                                          onChange={(e) => setEditingCategory({...editingCategory, seoTitle: e.target.value})}
                                          className="h-12 bg-card border-border px-6 text-[11px] font-bold"
                                      />
                                  </div>
                                  <div className="space-y-3">
                                       <label className="text-[10px] font-black uppercase opacity-40 italic">SEO Description</label>
                                      <textarea 
                                          value={editingCategory.seoDescription || ""} 
                                          onChange={(e) => setEditingCategory({...editingCategory, seoDescription: e.target.value})}
                                          className="w-full h-24 bg-card border border-border rounded-xl p-6 text-[11px] font-medium outline-none"
                                      />
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
