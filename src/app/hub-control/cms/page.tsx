"use client"

import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
    Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, Archive, Settings2,
    Zap, ShieldCheck, Truck, Activity, Box, Tag, Star, Mail, Loader2, Maximize, Minimize, Smartphone, BarChart3, Package, Phone, Clock, TrendingUp,
    Navigation, Search, Link as LinkIcon, MoveRight, Upload, Clipboard, ImageOff, FileText, Info as InfoIcon,
    LayoutDashboard as Layout, Image as ImageIcon, Settings as SettingsIcon, Share2, RefreshCw, Sparkles, Percent,
    Facebook, Instagram, Twitter, MessageCircle, Music2, Globe, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { AutoScroller } from "@/components/admin/AutoScroller"

const WhatsAppIcon = ({ size = 20, className }: { size?: number, className?: string }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

const ImageManager = ({ value, onChange, label, className }: { value: string, onChange: (val: string) => void, label: string, className?: string }) => {
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showLibrary, setShowLibrary] = useState(false)
    const [library, setLibrary] = useState<any[]>([])
    const [loadingLibrary, setLoadingLibrary] = useState(false)
    const [librarySearch, setLibrarySearch] = useState("")

    const fetchLibrary = async () => {
        setLoadingLibrary(true)
        try {
            const res = await fetch("/api/upload")
            const data = await res.json()
            if (data.success) setLibrary(data.files)
        } catch (e) {
            toast.error("Failed to load library")
        } finally {
            setLoadingLibrary(false)
        }
    }

    useEffect(() => {
        if (showLibrary) fetchLibrary()
    }, [showLibrary])

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/') || uploading) {
            if (!file.type.startsWith('image/')) toast.error("Invalid File: Only image files are allowed")
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
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-muted-foreground ">{label}</label>
                <button 
                    type="button"
                    onClick={() => setShowLibrary(!showLibrary)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                >
                    <Archive size={10} /> {showLibrary ? "Close Library" : "Asset Library"}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {showLibrary ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="h-48 rounded-2xl border border-border bg-muted/30 overflow-hidden flex flex-col"
                    >
                        <div className="p-3 border-b border-border flex items-center justify-between bg-card/50 gap-4">
                             <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Source Repository ({library.length})</span>
                             </div>
                             <div className="relative flex-1">
                                <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
                                <input 
                                    type="text"
                                    placeholder="Filter assets..."
                                    value={librarySearch}
                                    onChange={(e) => setLibrarySearch(e.target.value)}
                                    className="w-full h-7 pl-8 pr-4 bg-white/5 border border-slate-200 rounded-full text-[9px] font-bold uppercase outline-none focus:border-primary/30 transition-all"
                                />
                             </div>
                             {loadingLibrary && <Loader2 size={10} className="animate-spin text-primary" />}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 no-scrollbar">
                            {library.filter(img => (img.name || img.path || "").toLowerCase().includes(librarySearch.toLowerCase())).map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onChange(img.url)
                                        setShowLibrary(false)
                                        toast.success("Asset Selected")
                                    }}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 transition-all p-1 bg-card hover:scale-105 active:scale-95 group/lib",
                                        value === img.url ? "border-primary shadow-lg shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <img src={img.url} alt="" className="w-full h-full object-contain rounded-lg" title={img.name} />
                                </button>
                            ))}
                            {library.length === 0 && !loadingLibrary && (
                                <div className="col-span-full h-24 flex flex-col items-center justify-center opacity-20 grayscale">
                                    <ImageIcon size={20} />
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] mt-2">Library Empty</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
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

                                {/* Delete Command */}
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
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] mt-1 ">Standard Media Upload</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

type Section = "navigation" | "banners" | "categories" | "homepage" | "footer" | "support" | "pages"

export default function CMSPage() {
    const [activeTab, setActiveTab] = useState<Section>("navigation")
    const [data, setData] = useState<any>({
        settings: {}, banners: [], categories: [], brands: [], testimonials: [], pages: []
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingLink, setEditingLink] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [editingBanner, setEditingBanner] = useState<any>(null)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [editingFooterCluster, setEditingFooterCluster] = useState<any>(null)
    const [supportSettings, setSupportSettings] = useState<any>(null)
    const [editingSection, setEditingSection] = useState<any>(null)
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
    const drawerRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to top when any side panel is opened
    useEffect(() => {
        if (editingSection || editingCategory || editingLink !== null || editingFooterCluster || editingBanner) {
            // Short delay to ensure DOM is rendered before scrolling
            setTimeout(() => {
                // Find specifically marked scrolling containers inside the open drawer modal
                const scrollableDivs = document.querySelectorAll('.scroll-target');
                scrollableDivs.forEach(div => {
                    div.scrollTo({ top: 0, behavior: 'instant' });
                });
                
                // Fallback for ref if attached specifically to the correct element
                if (drawerRef.current) {
                    drawerRef.current.scrollTo({ top: 0, behavior: 'instant' });
                }
            }, 50)
        }
    }, [editingSection, editingCategory, editingLink, editingFooterCluster, editingBanner])

    const handleAddSection = (type: string) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newSection = {
            id,
            type,
            isActive: true,
            title: `NEW ${type.replace('_', ' ').toUpperCase()}`,
            config: type === 'featured_products' ? { limit: 10, source: "all", iconType: "smartphones" } : {}
        }

        setData((prev: any) => {
            const sections = [...(prev.hpConfig?.sections || []), newSection]
            // Auto-open editor for the newest item
            setTimeout(() => {
                setEditingSection({ ...newSection, index: sections.length - 1 })
            }, 100)

            return {
                ...prev,
                hpConfig: { ...prev.hpConfig, sections }
            }
        })
        toast.success(`Success: Added ${type.replace('_', ' ')}`)
    }

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
                    catch (e) { return [] }
                }

                const normalizeObj = (field: any) => {
                    if (!field) return {}
                    try { return typeof field === 'string' ? JSON.parse(field) : field }
                    catch (e) { return {} }
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

    const syncInventoryCategories = async () => {
        const syncToast = toast.loading("Syncing inventory categories...")
        try {
            const prodRes = await fetch("/api/products?all=true")
            const prods = await prodRes.json()
            const inventoryCategories = Array.from(new Set(prods.map((p: any) => p.category).filter(Boolean)))
            const existingNames = new Set(data.categories.map((c: any) => c.name.toLowerCase()))
            const missing = inventoryCategories.filter((name: any) => !existingNames.has(name.toLowerCase()))
            if (missing.length === 0) {
                toast.success("Categories already in sync", { id: syncToast })
                return
            }
            await Promise.all(missing.map(name =>
                fetch("/api/cms/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, isActive: true, imageUrl: "" })
                })
            ))
            toast.success(`Synced ${missing.length} new categories`, { id: syncToast })
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Sync failed", { id: syncToast })
        }
    }

    const syncInventoryBrands = async () => {
        const syncToast = toast.loading("Syncing inventory brands...")
        try {
            const prodRes = await fetch("/api/products?all=true")
            const prods = await prodRes.json()
            const inventoryBrands = Array.from(new Set(prods.map((p: any) => p.brand).filter(Boolean)))
            const existingNames = new Set(data.brands.map((b: any) => b.name.toLowerCase()))
            const missing = inventoryBrands.filter((name: any) => !existingNames.has(name.toLowerCase()))
            if (missing.length === 0) {
                toast.success("Brands already in sync", { id: syncToast })
                return
            }
            await Promise.all(missing.map(name =>
                fetch("/api/cms/brands", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, isActive: true, imageUrl: "" })
                })
            ))
            toast.success(`Synced ${missing.length} new brands`, { id: syncToast })
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Sync failed", { id: syncToast })
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
            // Virtual Field Handling
            if (section === "categories") {
                delete syncPayload.slug;
            }

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

    const handleMove = async (section: "categories" | "brands", id: string, direction: "left" | "right") => {
        const items = section === "categories" ? [...(data.categories || [])] : [...(data.brands || [])]
        const idx = items.findIndex(i => i.id === id)
        if (idx === -1) return
        if (direction === "left" && idx === 0) return
        if (direction === "right" && idx === items.length - 1) return

        const newIdx = direction === "left" ? idx - 1 : idx + 1
        const temp = items[idx]
        items[idx] = items[newIdx]
        items[newIdx] = temp

        // Update local state first
        setData((prev: any) => ({ ...prev, [section]: items }))

        // Persist order to database
        try {
            await Promise.all([
                fetch(`/api/cms/${section}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: items[idx].id, order: idx })
                }),
                fetch(`/api/cms/${section}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: items[newIdx].id, order: newIdx })
                })
            ])
            toast.success("Order Synchronized")
        } catch (e) {
            toast.error("Failed to sync order")
            fetchData()
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

    const tabs: { id: Section, icon: any }[] = [
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
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary ">
                        <Activity size={12} className="animate-pulse" />
                        Content Management System
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground  uppercase leading-none">Storefront <span className="text-primary ">CMS</span></h1>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-none mt-2">Manage <span className="text-foreground">Site Content and Layout</span>.</p>
                </div>
                <Button onClick={fetchData} variant="outline" className="h-16 px-8 rounded-2xl border-primary/20 bg-card gap-4 font-black  tracking-widest uppercase text-xs hover:border-primary transition-all shadow-2xl shadow-primary/5">
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
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-3xl font-black  tracking-tighter uppercase leading-none">Navigation Settings</h2>
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest  underline decoration-primary/30 underline-offset-4">Manage primary site menus</span>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                const newLinks = [...(data.settings.navbarLinks || []), { name: "NEW LINK", href: "/", subLinks: [] }]
                                                handleUpdate("settings", { navbarLinks: newLinks })
                                            }}
                                            className="h-14 rounded-2xl px-10 bg-primary text-white text-[10px] font-black  uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> CREATE NEW LINK
                                        </Button>
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
                                                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary text-white flex items-center justify-center text-xs lg:text-sm font-black  shadow-lg shrink-0">{idx + 1}</div>
                                                    <div className="flex flex-col min-w-0">
                                                        <h4 className="text-base lg:text-lg font-black uppercase tracking-tighter  leading-none truncate">{link.name || "UNNAMED"}</h4>
                                                        <div className="flex items-center gap-3 mt-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground  truncate">
                                                            <LinkIcon size={10} className="text-primary" /> {link.href}
                                                            <span className="opacity-20">•</span>
                                                            <Box size={10} className="text-primary" /> {link.subLinks?.length || 0} Sub-links
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="flex items-center bg-card p-1 rounded-xl lg:rounded-2xl border border-border shrink-0">
                                                        <Button
                                                            onClick={() => {
                                                                const newLinks = [...data.settings.navbarLinks]
                                                                if (idx > 0) {
                                                                    [newLinks[idx], newLinks[idx - 1]] = [newLinks[idx - 1], newLinks[idx]]
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
                                                                    [newLinks[idx], newLinks[idx + 1]] = [newLinks[idx + 1], newLinks[idx]]
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

                                    <Button onClick={() => handleUpdate("settings", { navbarLinks: data.settings.navbarLinks })} className="h-20 rounded-[2rem] bg-foreground text-background font-black  tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl mt-6 border-4 border-background ring-2 ring-foreground/10">
                                        <Save size={24} className="mr-4" /> SAVE NAVIGATION SETTINGS
                                    </Button>
                                </div>
                            </Card>

                            {/* GLOBAL NAVIGATION EDITOR - RIGHT SIDE SLIDE-OVER */}
                            <AnimatePresence>
                                {editingLink !== null && activeTab === "navigation" && (
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
                                            ref={drawerRef}
                                            className="relative h-full w-full lg:max-w-[700px] bg-card border-l border-border shadow-[-80px_0_150px_rgba(0,0,0,0.6)] flex flex-col"
                                        >
                                            {/* Drawer Header */}
                                            <div className="p-6 lg:p-8 border-b border-border bg-muted/30 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 shrink-0 sticky top-0 z-50 backdrop-blur-xl">
                                                <div className="flex items-center gap-4 lg:gap-5">
                                                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-[1.5rem] bg-primary text-white flex items-center justify-center text-xl lg:text-2xl font-black  shadow-2xl shadow-primary/20">
                                                        <Edit2 size={24} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary  leading-none">Navigation Editor</span>
                                                        <h4 className="text-xl lg:text-3xl font-black uppercase tracking-tighter  leading-none mt-2 truncate max-w-[150px] lg:max-w-none">{data.settings.navbarLinks[editingLink]?.name || "UNNAMED"}</h4>
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
                                                <AutoScroller trigger={editingLink} />
                                                <div className="flex flex-col gap-8">
                                                    <div className="flex flex-col gap-3">
                                                        <label className="text-[10px] font-black uppercase text-primary  flex items-center gap-2">
                                                            <Tag size={12} /> Link Label
                                                        </label>
                                                        <Input
                                                            value={data.settings.navbarLinks[editingLink].name}
                                                            onChange={(e) => {
                                                                const newLinks = [...data.settings.navbarLinks]
                                                                newLinks[editingLink].name = e.target.value
                                                                setData({ ...data, settings: { ...data.settings, navbarLinks: newLinks } })
                                                            }}
                                                            className="h-16 border-border bg-background rounded-2xl text-lg font-black uppercase  px-6 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-3 px-2">
                                                        <label className="text-[10px] font-black uppercase text-primary  flex items-center gap-2">
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
                                                                setData({ ...data, settings: { ...data.settings, navbarLinks: newLinks } })
                                                            }}
                                                            onPaste={(e) => e.stopPropagation()}
                                                            placeholder="/path/to/collection-or-product"
                                                            className="h-16 border-border bg-background rounded-2xl font-black  text-sm px-6 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                                                        />
                                                    </div>

                                                    {/* Sub-menu Items */}
                                                    <div className="flex flex-col gap-6 bg-muted/20 p-8 rounded-[2.5rem] border border-border shadow-inner mt-4">
                                                        <div className="flex items-center justify-between px-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"><Box size={20} /></div>
                                                                <span className="text-[12px] font-black uppercase tracking-widest  text-primary">Sub-menu Items</span>
                                                            </div>
                                                            <Button
                                                                onClick={() => {
                                                                    const newLinks = [...data.settings.navbarLinks]
                                                                    newLinks[editingLink].subLinks = [...(newLinks[editingLink].subLinks || []), { name: "NEW LINK", href: "/" }]
                                                                    setData({ ...data, settings: { ...data.settings, navbarLinks: newLinks } })
                                                                }}
                                                                className="h-11 rounded-xl px-5 bg-primary text-white font-black  uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                                                            >
                                                                <Plus size={16} className="mr-2" /> ADD LINK
                                                            </Button>
                                                        </div>

                                                        <div className="flex flex-col gap-4">
                                                            {(data.settings.navbarLinks[editingLink].subLinks || []).map((sub: any, sIdx: number) => (
                                                                <div key={sIdx} className="flex flex-col gap-3 p-4 bg-background dark:bg-slate-900 border border-border rounded-2xl shadow-sm hover:border-primary/40 transition-all relative">
                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="text-[8px] font-black uppercase text-muted-foreground  px-2">Display Label</label>
                                                                        <Input
                                                                            value={sub.name}
                                                                            onChange={(e) => {
                                                                                const newLinks = [...data.settings.navbarLinks]
                                                                                newLinks[editingLink].subLinks[sIdx].name = e.target.value
                                                                                setData({ ...data, settings: { ...data.settings, navbarLinks: newLinks } })
                                                                            }}
                                                                            className="h-10 border-border text-[11px] font-black uppercase  bg-muted/10 rounded-xl px-4 shadow-inner"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="text-[8px] font-black uppercase text-muted-foreground  px-2">Destination URL</label>
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
                                                                                    setData({ ...data, settings: { ...data.settings, navbarLinks: newLinks } })
                                                                                }}
                                                                                onPaste={(e) => e.stopPropagation()}
                                                                                placeholder="/path/to/target"
                                                                                className="h-10 flex-1 border-border text-[11px] font-black  bg-muted/10 rounded-xl px-4"
                                                                            />
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newLinks = [...data.settings.navbarLinks]
                                                                                    newLinks[editingLink].subLinks = newLinks[editingLink].subLinks.filter((_: any, i: number) => i !== sIdx)
                                                                                    setData({ ...data, settings: { ...data.settings, navbarLinks: newLinks } })
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
                                                                <div className="text-[10px] font-black uppercase opacity-30 text-center py-16  tracking-[0.3em] border-2 border-dashed border-border rounded-[2rem] bg-muted/5">No links defined for this menu</div>
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
                                                    className="h-20 w-full rounded-3xl bg-foreground text-background font-black  tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl border-4 border-background ring-2 ring-foreground/10"
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
                                    className="bg-primary text-white font-black h-14 px-8 rounded-2xl shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 uppercase  tracking-widest text-[10px]"
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
                                                        "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border-2 transition-all ",
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
                                                        if (prev) {
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
                                                        if (next) {
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
                                                        className="h-10 px-4 flex items-center gap-2 text-primary hover:bg-primary/5 rounded-xl transition-all font-black uppercase  text-[10px] tracking-widest border border-primary/20 shrink-0 whitespace-nowrap"
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
                                                        <h3 className="text-lg lg:text-xl font-black  uppercase tracking-tighter">Banner Configuration</h3>
                                                        <p className="text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50 underline underline-offset-4 decoration-primary/30">Visual content sync</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
                                                    <Button
                                                        onClick={() => {
                                                            handleUpdate("banners", editingBanner);
                                                            setEditingBanner(null);
                                                        }}
                                                        className="h-12 lg:h-14 flex-1 lg:flex-none px-6 lg:px-8 rounded-xl lg:rounded-2xl bg-primary text-white font-black  uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
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
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ">Panoramic Preview (1920x600 Guide)</span>
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
                                                                            <h4 className="font-black  tracking-tighter uppercase text-xl sm:text-4xl leading-[0.9] max-w-sm text-white drop-shadow-2xl">
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
                                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] ">Banner Content</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-8">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ">Headline Text</label>
                                                                    <Input
                                                                        value={editingBanner.title}
                                                                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                                                        className="h-14 rounded-2xl border-border bg-muted/10 px-6 font-black  uppercase tracking-widest text-sm"
                                                                        placeholder="ENTER HEADLINE..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-8">
                                                            <div className="flex items-center gap-3 text-primary">
                                                                <ImageIcon size={18} />
                                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] ">Visual Assets</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-8">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <label className="text-[10px] font-black uppercase opacity-40 ">Hero Image</label>
                                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20">Recommended: 1920x600 px</span>
                                                                </div>
                                                                <ImageManager
                                                                    label=""
                                                                    value={editingBanner.imageUrl}
                                                                    onChange={(val: string) => setEditingBanner({ ...editingBanner, imageUrl: val })}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-8">
                                                            <div className="flex items-center gap-3 text-primary">
                                                                <SettingsIcon size={18} />
                                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] ">Configuration Settings</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-4 md:gap-8 p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-muted/10 border border-border shadow-inner">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ">Destination URL (Redirect)</label>
                                                                    <Input
                                                                        value={editingBanner.buttonLink}
                                                                        onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
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
                                                        className={cn("h-12 lg:h-16 flex-1 px-5 lg:px-10 rounded-2xl lg:rounded-3xl font-black  uppercase tracking-widest text-[8px] lg:text-[10px] border-4 transition-all shadow-xl", editingBanner.isActive ? "text-amber-500 border-amber-500/10 hover:bg-amber-500 hover:text-white" : "text-emerald-500 border-emerald-500/10 hover:bg-emerald-500 hover:text-white")}
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
                                                        className="h-12 lg:h-16 flex-[2] lg:flex-1 rounded-2xl lg:rounded-3xl bg-foreground text-background font-black  uppercase tracking-[0.15em] lg:tracking-[0.2em] text-[10px] lg:text-[12px] shadow-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
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
                    {/* HOMEPAGE MANAGEMENT & ARCHITECTURE */}
                    {activeTab === "homepage" && (
                        <div className="flex flex-col gap-10">
                            {/* Matrix Architecture Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/60 pb-10">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                        <Layout size={12} className="animate-pulse" />
                                        Page Setup
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-black  tracking-tighter uppercase leading-none">Design Your Screen</h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 ">Pick a section to add to your homepage below</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {(!data.hpConfig?.sections || data.hpConfig.sections.length === 0) && (
                                        <Button
                                            onClick={() => {
                                                const premiumLayout = [
                                                    { id: "hero-1", type: "hero", isActive: true, title: "HERO PREVIEW", config: { headline: "ELITE ELECTRONICS", subheadline: "NEXT GENERATION GEAR", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085" } },
                                                    { id: "trust-1", type: "trust_bar", isActive: true, title: "TRUST INDICATORS" },
                                                    { id: "cat-1", type: "categories", isActive: true, title: "BROWSE CATEGORIES", config: { columns: 4 } },
                                                    { id: "feat-1", type: "featured_products", isActive: true, title: "NEW ARRIVALS", config: { source: "new", iconType: "newArrivals" } },
                                                    { id: "promo-1", type: "promo_banner", isActive: true, title: "AD BANNER", config: { image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179", link: "/products" } },
                                                    { id: "feat-2", type: "featured_products", isActive: true, title: "BEST SELLERS", config: { source: "featured", iconType: "featured" } },
                                                    { id: "brand-1", type: "brand_showcase", isActive: true, title: "SHOP BY BRANDS" },
                                                    { id: "feat-3", type: "featured_products", isActive: true, title: "SMARTPHONES", config: { source: "Smartphones", iconType: "smartphones" } },
                                                ]
                                                setData({ ...data, hpConfig: { ...data.hpConfig, sections: premiumLayout } })
                                            }}
                                            className="h-14 px-6 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] shadow-2xl hover:scale-105 transition-all text-foreground"
                                        >
                                            RESET TO FACTORY LAYOUT
                                        </Button>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button onClick={() => handleAddSection("featured_products")} className="h-14 px-5 rounded-xl bg-blue-500 text-white font-black uppercase tracking-widest text-[9px] shadow-lg hover:scale-105 transition-all gap-2"><Package size={14} /> ADD PRODUCTS</Button>
                                        <Button onClick={() => handleAddSection("promo_banner")} className="h-14 px-5 rounded-xl bg-purple-500 text-white font-black uppercase tracking-widest text-[9px] shadow-lg hover:scale-105 transition-all gap-2"><Sparkles size={14} /> ADD AD BANNER</Button>
                                        <Button onClick={() => handleAddSection("categories")} className="h-14 px-5 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px] shadow-lg hover:scale-105 transition-all gap-2"><Layout size={14} /> ADD CATEGORIES</Button>
                                        <Button onClick={() => handleAddSection("brand_showcase")} className="h-14 px-5 rounded-xl bg-slate-700 text-white font-black uppercase tracking-widest text-[9px] shadow-lg hover:scale-105 transition-all gap-2"><Share2 size={14} /> ADD BRANDS</Button>

                                    </div>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {(!data.hpConfig?.sections || data.hpConfig.sections.length === 0) ? (
                                    <div className="p-20 rounded-[4rem] border-4 border-dashed border-border/40 bg-muted/20 flex flex-col items-center justify-center text-center gap-8">
                                        <div className="w-24 h-24 rounded-full bg-card shadow-2xl flex items-center justify-center text-primary/20">
                                            <Layout size={48} />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">No Active Architecture Detected</h3>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">Initialize a premium layout or add your first block above</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Reorder.Group 
                                        axis="y" 
                                        values={data.hpConfig.sections} 
                                        onReorder={(newSects) => {
                                            setData((prev: any) => ({ 
                                                ...prev, 
                                                hpConfig: { ...prev.hpConfig, sections: newSects } 
                                            }));
                                        }}
                                        className="flex flex-col gap-3"
                                    >
                                        {data.hpConfig.sections.map((sec: any, idx: number) => {
                                            const typeColors: Record<string, string> = {
                                                featured_products: "blue",
                                                flash_deals: "rose",
                                                promo_banner: "purple",
                                                categories: "emerald",
                                                brand_showcase: "slate",
                                                trust_bar: "rose"
                                            };
                                            const themeColor = typeColors[sec.type] || "blue";
                                            return (
                                                <Reorder.Item
                                                    key={sec.id}
                                                    value={sec}
                                                    className={cn(
                                                        "group p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-4 relative overflow-hidden cursor-grab active:cursor-grabbing",
                                                        sec.isActive
                                                            ? `bg-${themeColor}-500/5 border-${themeColor}-500/30 shadow-md hover:border-${themeColor}-500/60`
                                                            : "bg-muted/40 border-dashed border-border opacity-60"
                                                    )}
                                                >
                                                    {/* Accent gradient for active items */}
                                                    {sec.isActive && (
                                                        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${themeColor}-500 opacity-20`} />
                                                    )}

                                                    <div className="flex items-center gap-4 z-10 pointer-events-none select-none">
                                                        <div className="flex flex-col items-center bg-background/50 p-1.5 rounded-xl border border-border/40 shadow-inner">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (idx > 0) {
                                                                        const newSects = [...data.hpConfig.sections];
                                                                        [newSects[idx], newSects[idx - 1]] = [newSects[idx - 1], newSects[idx]];
                                                                        setData((prev: any) => ({ ...prev, hpConfig: { ...prev.hpConfig, sections: newSects } }));
                                                                    }
                                                                }} 
                                                                disabled={idx === 0} 
                                                                className="p-1.5 hover:text-primary transition-colors disabled:opacity-20 pointer-events-auto"
                                                            >
                                                                <MoveUp size={16} />
                                                            </button>
                                                            <div className="w-4 h-px bg-border/40 my-1" />
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (idx < data.hpConfig.sections.length - 1) {
                                                                        const newSects = [...data.hpConfig.sections];
                                                                        [newSects[idx], newSects[idx + 1]] = [newSects[idx + 1], newSects[idx]];
                                                                        setData((prev: any) => ({ ...prev, hpConfig: { ...prev.hpConfig, sections: newSects } }));
                                                                    }
                                                                }} 
                                                                disabled={idx === data.hpConfig.sections.length - 1} 
                                                                className="p-1.5 hover:text-primary transition-colors disabled:opacity-20 pointer-events-auto"
                                                            >
                                                                <MoveDown size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-${themeColor}-500 bg-${themeColor}-500/10 px-3 py-1 rounded-full border border-${themeColor}-500/20`}>
                                                                    {sec.type.replace('_', ' ')}
                                                                </span>
                                                                <span className={`bg-${themeColor}-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase shadow-lg shadow-${themeColor}-500/20 ring-2 ring-white/50`}>
                                                                    POS {idx + 1}
                                                                </span>
                                                                {sec.type === 'featured_products' && sec.config?.source && (
                                                                    <span className="bg-primary/5 text-primary/60 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-primary/10">
                                                                        {sec.config.source === 'new' ? 'New Arrivals' : sec.config.source === 'featured' ? 'Best Sellers' : sec.config.source}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="text-sm font-black uppercase tracking-tighter leading-none italic group-hover:translate-x-1 transition-transform">{sec.title || "Untitled Block"}</h4>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 z-10">
                                                        <div className="flex items-center bg-muted/50 p-2 rounded-xl border border-border/20 mr-4">
                                                            <Button
                                                                onClick={() => {
                                                                    const sects = [...data.hpConfig.sections];
                                                                    sects[idx].isActive = !sects[idx].isActive;
                                                                    setData((prev: any) => ({ ...prev, hpConfig: { ...prev.hpConfig, sections: sects } }));
                                                                }}
                                                                variant="ghost"
                                                                className={cn(
                                                                    "h-9 px-6 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-lg",
                                                                    sec.isActive ? `bg-${themeColor}-500 text-white` : "bg-rose-600 text-white"
                                                                )}
                                                            >
                                                                {sec.isActive ? "ACTIVE" : "HIDDEN"}
                                                            </Button>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setEditingSection({ ...sec, index: idx })}
                                                                className={`w-10 h-10 bg-${themeColor}-500/10 text-${themeColor}-500 border border-${themeColor}-500/20 rounded-xl flex items-center justify-center hover:bg-${themeColor}-500 hover:text-white transition-all shadow-sm`}
                                                                title="Edit Section"
                                                            >
                                                                <Settings2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm("Delete this section permanently?")) {
                                                                        const sects = data.hpConfig.sections.filter((_: any, i: number) => i !== idx);
                                                                        setData((prev: any) => ({ ...prev, hpConfig: { ...prev.hpConfig, sections: sects } }));
                                                                        toast.error("Section Removed");
                                                                    }
                                                                }}
                                                                className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-sm"
                                                                title="Remove Section"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Background decorative element */}
                                                    <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-${themeColor}-500/5 rounded-full blur-3xl pointer-events-none`} />
                                                </Reorder.Item>
                                            );
                                        })}
                                    </Reorder.Group>

                                )}
                            </div>

                            <Button
                                onClick={async () => {
                                    setSaving(true);
                                    try {
                                        const res = await fetch("/api/config/homepage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data.hpConfig) });
                                        if (res.ok) { toast.success("Composition Synchronized"); fetchData(); } else toast.error("Sync Failure");
                                    } catch (e) { toast.error("Network Error"); } finally { setSaving(false); }
                                }}
                                className="h-20 rounded-[2.5rem] bg-foreground text-background font-black uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl mt-8 border-4 border-background ring-2 ring-foreground/10"
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save size={24} className="mr-3" />} SAVE TO HOMEPAGE
                            </Button>

                            {/* Section Editor Drawer (Integrated) */}
                            <AnimatePresence>
                                {editingSection && (
                                    <div className="fixed inset-0 z-[1000] flex justify-end">
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingSection(null)} className="absolute inset-0 bg-slate-950/70 backdrop-blur-3xl" />
                                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 250 }} ref={drawerRef} className="relative h-full w-full max-w-[700px] bg-card border-l border-white/10 shadow-2xl flex flex-col">
                                            <div className="p-10 border-b border-border bg-muted/20 flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{editingSection.type} Editor</span>
                                                    <h4 className="text-3xl font-black uppercase tracking-tighter italic">{editingSection.title || "Untitled"}</h4>
                                                </div>
                                                <button onClick={() => setEditingSection(null)} className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={24} /></button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                                                <AutoScroller trigger={editingSection?.id} />
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase opacity-40">Display Title</label>
                                                    <Input value={editingSection.title || ""} onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })} className="h-16 rounded-2xl bg-muted/20 border-border px-6 text-lg font-black uppercase" />
                                                </div>
                                                {/* Hero Slider Section is removed */}

                                                {editingSection.type === 'promo_banner' && (
                                                    <div className="space-y-6">
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase opacity-40">Banner Title</label>
                                                            <Input value={editingSection.config?.title || ""} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, title: e.target.value } })} className="h-14 rounded-xl" />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase opacity-40">Banner Subtitle</label>
                                                            <Input value={editingSection.config?.subtitle || ""} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, subtitle: e.target.value } })} className="h-14 rounded-xl" />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase opacity-40">Background Image</label>
                                                            <ImageManager label="Promo Cover" value={editingSection.config?.imageUrl || ""} onChange={(v: string) => setEditingSection({ ...editingSection, config: { ...editingSection.config, imageUrl: v } })} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-4">
                                                                <label className="text-[10px] font-black uppercase opacity-40">Target Link</label>
                                                                <Input value={editingSection.config?.link || ""} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, link: e.target.value } })} className="h-14 rounded-xl" />
                                                            </div>
                                                            <div className="space-y-4">
                                                                <label className="text-[10px] font-black uppercase opacity-40">Theme</label>
                                                                <select value={editingSection.config?.dark ? "dark" : "light"} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, dark: e.target.value === "dark" } })} className="w-full h-14 rounded-xl bg-background border border-border px-4 text-xs font-black uppercase">
                                                                    <option value="dark">Dark Mode</option>
                                                                    <option value="light">Light Mode</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {editingSection.type === 'brand_showcase' && (
                                                    <div className="space-y-8">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black uppercase opacity-40">Choose Display Brands</label>
                                                                <span className="text-[8px] font-black text-primary uppercase">Click to toggle</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {data.brands?.map((brand: any) => {
                                                                    const isSelected = editingSection.config?.selectedBrands?.includes(brand.id)
                                                                    return (
                                                                        <button
                                                                            key={brand.id}
                                                                            onClick={() => {
                                                                                const selected = editingSection.config?.selectedBrands || []
                                                                                const newSelected = selected.includes(brand.id)
                                                                                    ? selected.filter((id: any) => id !== brand.id)
                                                                                    : [...selected, brand.id]
                                                                                setEditingSection({ ...editingSection, config: { ...editingSection.config, selectedBrands: newSelected } })
                                                                            }}
                                                                            className={cn(
                                                                                "p-5 rounded-2xl border-2 text-[11px] font-black uppercase text-left transition-all flex items-center gap-4",
                                                                                isSelected 
                                                                                    ? "bg-primary border-primary text-white shadow-[0_10px_30px_rgba(var(--primary),0.3)] scale-[1.02]" 
                                                                                    : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
                                                                            )}
                                                                        >
                                                                            <div className={cn("w-3 h-3 rounded-full border-2", isSelected ? "bg-white border-white" : "bg-muted-foreground/30 border-transparent")} />
                                                                            {brand.name}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {editingSection.type === 'trust_bar' && (
                                                    <div className="space-y-8">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col gap-1">
                                                                <label className="text-[11px] font-black uppercase tracking-widest text-primary italic">Trust Markers</label>
                                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Define localized benefits for this section</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const currentItems = editingSection.config?.items || []
                                                                    setEditingSection({ ...editingSection, config: { ...editingSection.config, items: [...currentItems, { id: Math.random(), title: "Safe Shipping", subtitle: "Fast & Free", icon: "Truck" }] } })
                                                                }}
                                                                className="h-10 px-6 rounded-xl text-[9px] font-black bg-primary text-white hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                                            >
                                                                ADD TRUST MARKER
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {(editingSection.config?.items || data.trust || []).map((item: any, iIdx: number) => (
                                                                <div key={iIdx} className="p-6 bg-muted/20 border border-border/40 rounded-[2rem] flex flex-col gap-6 group relative">
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div className="flex-1 space-y-4">
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[9px] font-black uppercase opacity-40">Marker Title</label>
                                                                                    <Input
                                                                                        value={item.title || ""}
                                                                                        onChange={(e) => {
                                                                                            const items = [...(editingSection.config?.items || data.trust)]
                                                                                            items[iIdx] = { ...items[iIdx], title: e.target.value }
                                                                                            setEditingSection({ ...editingSection, config: { ...editingSection.config, items } })
                                                                                        }}
                                                                                        placeholder="e.g. Worldwide Shipping"
                                                                                        className="h-12 rounded-xl text-[11px] font-black uppercase"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[9px] font-black uppercase opacity-40">Sub-Title</label>
                                                                                    <Input
                                                                                        value={item.subtitle || ""}
                                                                                        onChange={(e) => {
                                                                                            const items = [...(editingSection.config?.items || data.trust)]
                                                                                            items[iIdx] = { ...items[iIdx], subtitle: e.target.value }
                                                                                            setEditingSection({ ...editingSection, config: { ...editingSection.config, items } })
                                                                                        }}
                                                                                        placeholder="e.g. Within 24 hours"
                                                                                        className="h-12 rounded-xl text-[10px] font-medium"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-[9px] font-black uppercase opacity-40">Lucide Icon Name</label>
                                                                                <div className="relative">
                                                                                    <Input
                                                                                        value={item.icon || "Box"}
                                                                                        onChange={(e) => {
                                                                                            const items = [...(editingSection.config?.items || data.trust)]
                                                                                            items[iIdx] = { ...items[iIdx], icon: e.target.value }
                                                                                            setEditingSection({ ...editingSection, config: { ...editingSection.config, items } })
                                                                                        }}
                                                                                        className="h-12 rounded-xl pl-12 text-[11px] font-black tracking-widest uppercase border-primary/20 bg-primary/5"
                                                                                    />
                                                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                                                                                        <ShieldCheck size={16} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                const items = (editingSection.config?.items || data.trust).filter((_: any, i: number) => i !== iIdx)
                                                                                setEditingSection({ ...editingSection, config: { ...editingSection.config, items } })
                                                                            }}
                                                                            className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all order-last"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {editingSection.type === 'categories' && (
                                                    <div className="space-y-8">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black uppercase opacity-40">Choose Display Categories</label>
                                                                <span className="text-[8px] font-black text-primary uppercase">Click to toggle</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {data.categories?.map((cat: any) => {
                                                                    const isSelected = editingSection.config?.selectedCategories?.includes(cat.id)
                                                                    return (
                                                                        <button
                                                                            key={cat.id}
                                                                            onClick={() => {
                                                                                const selected = editingSection.config?.selectedCategories || []
                                                                                const newSelected = selected.includes(cat.id)
                                                                                    ? selected.filter((id: any) => id !== cat.id)
                                                                                    : [...selected, cat.id]
                                                                                setEditingSection({ ...editingSection, config: { ...editingSection.config, selectedCategories: newSelected } })
                                                                            }}
                                                                            className={cn(
                                                                                "p-4 rounded-xl border text-[10px] font-black uppercase text-left transition-all flex items-center gap-3",
                                                                                isSelected ? "bg-primary border-primary text-white shadow-lg" : "bg-card border-border text-foreground hover:bg-muted"
                                                                            )}
                                                                        >
                                                                            <div className={cn("w-2 h-2 rounded-full", isSelected ? "bg-white" : "bg-muted-foreground/20")} />
                                                                            {cat.name}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {editingSection.type === 'featured_products' && (
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-4">
                                                                <label className="text-[10px] font-black uppercase opacity-40">Source Rule</label>
                                                                <select value={editingSection.config?.source} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, source: e.target.value } })} className="w-full h-14 rounded-xl bg-background border border-border px-4 font-black uppercase text-[10px]">
                                                                    <option value="all">All Products</option>
                                                                    <option value="new">New Arrivals (isNew)</option>
                                                                    <option value="featured">Best Sellers (isHot)</option>
                                                                    <option value="discounts">Flash Discounts (Sale)</option>
                                                                    <option value="category">Specific Category</option>
                                                                    <option value="brand">Specific Brand</option>
                                                                </select>
                                                            </div>
                                                            {(editingSection.config?.source === 'category' || editingSection.config?.source === 'category') && (
                                                                <div className="space-y-4">
                                                                    <label className="text-[10px] font-black uppercase opacity-40">Select Category</label>
                                                                    <select value={editingSection.config?.categoryName} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, categoryName: e.target.value } })} className="w-full h-14 rounded-xl bg-background border border-border px-4 font-black uppercase text-[10px]">
                                                                        <option value="">Choose...</option>
                                                                        {data.categories?.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            )}
                                                            {editingSection.config?.source === 'brand' && (
                                                                <div className="space-y-4">
                                                                    <label className="text-[10px] font-black uppercase opacity-40">Enter Brand Name</label>
                                                                    <Input value={editingSection.config?.brandName || ""} onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, brandName: e.target.value } })} placeholder="e.g. Apple" className="h-14 rounded-xl" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Integrated Banner Option */}
                                                        <div className="pt-8 mt-4 border-t border-border/40 space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex flex-col gap-1">
                                                                </div>
                                                            </div>

                                                            {editingSection.config?.showBanner && (
                                                                <div className="p-8 rounded-[2rem] bg-muted/20 border border-primary/10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                                                                    <ImageManager
                                                                        label="Banner Image"
                                                                        value={editingSection.config?.bannerImage || ""}
                                                                        onChange={(v: string) => setEditingSection({ ...editingSection, config: { ...editingSection.config, bannerImage: v } })}
                                                                    />
                                                                    <div className="grid grid-cols-2 gap-6">
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-black uppercase opacity-40">Banner Headline</label>
                                                                            <Input
                                                                                value={editingSection.config?.bannerTitle || ""}
                                                                                onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, bannerTitle: e.target.value } })}
                                                                                placeholder="e.g. SEASONAL SALE"
                                                                                className="h-14 rounded-xl border-primary/20"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-black uppercase opacity-40">Banner Sub-text</label>
                                                                            <Input
                                                                                value={editingSection.config?.bannerSubtitle || ""}
                                                                                onChange={(e) => setEditingSection({ ...editingSection, config: { ...editingSection.config, bannerSubtitle: e.target.value } })}
                                                                                placeholder="e.g. UP TO 50% OFF"
                                                                                className="h-14 rounded-xl border-primary/20"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                            <div className="p-10 border-t border-border bg-card flex justify-between items-center sticky bottom-0 z-50 backdrop-blur-md">
                                                <button onClick={() => setEditingSection(null)} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-colors">Discard Changes</button>
                                                <Button onClick={() => {
                                                    const sects = [...data.hpConfig.sections];
                                                    sects[editingSection.index] = { ...editingSection, index: undefined };
                                                    setData((prev: any) => ({ ...prev, hpConfig: { ...prev.hpConfig, sections: sects } }));
                                                    setEditingSection(null);
                                                    toast.success("Section Updated");
                                                }} className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20">APPLY CONFIG</Button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="h-px bg-border/40 my-10" />

                            {/* CATEGORY DIRECTORY INTEGRATION */}
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center justify-between border-b border-border pb-8 text-foreground">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter">Category Directory</h3>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Manage product groupings and navigation assets</p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                                        <Button
                                            onClick={syncInventoryCategories}
                                            variant="outline"
                                            className="h-14 px-8 rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[11px] hover:bg-primary/10 transition-all gap-2"
                                        >
                                            <Zap size={18} /> SYNC FROM INVENTORY
                                        </Button>
                                        <Button
                                            onClick={() => setEditingCategory({ name: "NEW CATEGORY", imageUrl: "", description: "", isActive: true, redirectUrl: "" })}
                                            className="h-14 px-8 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all"
                                        >
                                            <Plus size={20} className="mr-2" /> CREATE CATEGORY
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {(data.categories || []).map((cat: any) => (
                                        <div key={cat.id} className="group p-4 bg-card border border-border rounded-[2rem] hover:border-primary/40 transition-all flex flex-col gap-4 shadow-sm relative overflow-hidden">
                                            <div className="aspect-square rounded-[1.5rem] bg-muted/10 overflow-hidden relative border border-border/50 shrink-0">
                                                {cat.imageUrl ? (
                                                    <img src={cat.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-10 bg-gradient-to-br from-primary/20 to-indigo-500/20"><ImageIcon size={48} /></div>
                                                )}
                                                <div className="absolute top-3 right-3 flex gap-2">
                                                    {!cat.isActive && <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xl border-2 border-white/20"><Archive size={14} /></div>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 px-1">
                                                <h4 className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate">{cat.name}</h4>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-30">Category Entry</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-auto">
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => handleMove("categories", cat.id, "left")}
                                                        className="w-10 h-10 bg-muted/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMove("categories", cat.id, "right")}
                                                        className="w-10 h-10 bg-muted/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                                <Button
                                                    onClick={() => setEditingCategory(cat)}
                                                    className="flex-1 h-10 rounded-xl font-black uppercase text-[9px] tracking-widest bg-muted/20 text-foreground border border-transparent hover:bg-white hover:border-border hover:shadow-sm transition-all"
                                                >
                                                    EDIT
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete("categories", cat.id)}
                                                    className="w-10 h-10 bg-muted/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-border/40 my-10" />

                                {/* BRAND DIRECTORY INTEGRATION */}
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between border-b border-border pb-8 text-foreground">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Brand Directory</h3>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Manage official partner logos and brand redirects</p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                                            <Button
                                                onClick={syncInventoryBrands}
                                                variant="outline"
                                                className="h-14 px-8 rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[11px] hover:bg-primary/10 transition-all gap-2"
                                            >
                                                <Zap size={18} /> SYNC FROM INVENTORY
                                            </Button>
                                            <Button
                                                onClick={() => setEditingCategory({ name: "NEW BRAND", imageUrl: "", isActive: true, _type: 'brand' })}
                                                className="h-14 px-8 rounded-2xl bg-slate-700 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all"
                                            >
                                                <Plus size={20} className="mr-2" /> CREATE BRAND
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {(data.brands || []).map((brand: any) => (
                                            <div key={brand.id} className="group p-4 bg-card border border-border rounded-[2rem] hover:border-primary/40 transition-all flex flex-col gap-4 shadow-sm relative overflow-hidden">
                                                <div className="aspect-square rounded-[1.5rem] bg-white overflow-hidden relative border border-border/50 shrink-0 p-6 flex items-center justify-center">
                                                    {brand.imageUrl ? (
                                                        <img src={brand.imageUrl} className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-10 bg-gradient-to-br from-primary/20 to-indigo-500/20"><ImageIcon size={48} /></div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1 px-1 text-center">
                                                    <h4 className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate">{brand.name}</h4>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-30">Official Partner</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-auto">
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={() => handleMove("brands", brand.id, "left")}
                                                            className="w-10 h-10 bg-muted/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMove("brands", brand.id, "right")}
                                                            className="w-10 h-10 bg-muted/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                    <Button
                                                        onClick={() => setEditingCategory({ ...brand, _type: 'brand' })}
                                                        className="flex-1 h-10 rounded-xl font-black uppercase text-[9px] tracking-widest bg-muted/20 text-foreground border border-transparent hover:bg-white hover:border-border hover:shadow-sm transition-all"
                                                    >
                                                        EDIT
                                                    </Button>
                                                    <button
                                                        onClick={() => handleDelete("brands", brand.id)}
                                                        className="w-10 h-10 bg-muted/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "footer" && data && (
                        <div className="flex flex-col gap-16 py-10">
                            {/* Footer Configuration Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/60 pb-12 px-8">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-4xl lg:text-5xl font-black  tracking-tighter uppercase leading-none">Footer Content</h2>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50 ">Manage the site's footer content and links</span>
                                </div>
                                <Button
                                    onClick={() => handleUpdate("settings", data.settings)}
                                    className="h-16 px-10 rounded-2xl bg-primary text-white font-black  uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all border-4 border-background ring-2 ring-primary/10"
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
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] ">Brand Description</span>
                                    </div>

                                    <div className="flex flex-col gap-8 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase opacity-40  ml-2">Company Description</label>
                                            <textarea
                                                value={data.settings.companyDescription}
                                                onChange={(e) => setData({ ...data, settings: { ...data.settings, companyDescription: e.target.value } })}
                                                className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-xs font-medium  focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none shadow-sm"
                                                placeholder="Enter company description..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase opacity-40  ml-2">Copyright Identity Information</label>
                                                <Input
                                                    value={data.settings.copyrightText}
                                                    onChange={(e) => setData({ ...data, settings: { ...data.settings, copyrightText: e.target.value } })}
                                                    className="h-12 bg-background border-border rounded-xl font-bold  text-[11px] uppercase shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Link Group Management */}
                                <div className="lg:col-span-7 flex flex-col gap-8">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-[12px] font-black text-primary uppercase tracking-[0.3em] ">Link Groups</span>
                                        <Button
                                            onClick={() => {
                                                const clusters = [...(data.settings.footerLinks || [])]
                                                clusters.push({ title: "NEW LINK GROUP", links: [] })
                                                handleUpdate("settings", { footerLinks: clusters })
                                            }}
                                            className="h-12 px-6 rounded-xl bg-card border border-border text-foreground font-black  uppercase tracking-widest text-[10px] hover:bg-muted transition-all shadow-sm"
                                        >
                                            <Plus size={16} className="mr-2" /> CREATE GROUP
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                                        {(data.settings.footerLinks || []).map((cluster: any, idx: number) => (
                                            <Card key={idx} className="rounded-[2.5rem] border-border bg-card p-8 flex flex-col gap-6 group hover:border-primary/40 transition-all shadow-xl shadow-black/5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="flex flex-col gap-2 relative z-10">
                                                    <h3 className="text-2xl font-black  tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">{cluster.title || "UNNAMED"}</h3>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ">{cluster.links?.length || 0} LINKS ACTIVE</span>
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
                            <div className="space-y-10 mt-16 bg-muted/5 p-10 lg:p-14 rounded-[3.5rem] border border-border/50 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />

                                <div className="flex items-center gap-6 text-primary relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                                        <Share2 size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Social Links</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 leading-none mt-1.5">Manage store socials and contact links</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                    {[
                                        { name: "facebook", icon: <Facebook size={18} /> },
                                        { name: "instagram", icon: <Instagram size={18} /> },
                                        { name: "twitter", icon: <Twitter size={18} /> },
                                        { name: "tiktok", icon: <Music2 size={18} /> },
                                        { name: "whatsapp", icon: <WhatsAppIcon size={20} /> },
                                        { name: "phone", icon: <Phone size={18} /> }
                                    ].map((social) => (
                                        <div key={social.name} className="p-6 rounded-2xl bg-card border border-border shadow-md hover:border-primary transition-all flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                                {social.icon}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{social.name}</label>
                                                <Input
                                                    value={data.settings.socials?.[social.name] || ""}
                                                    onChange={(e) => setData({
                                                        ...data,
                                                        settings: {
                                                            ...data.settings,
                                                            socials: { ...data.settings.socials, [social.name]: e.target.value }
                                                        }
                                                    })}
                                                    className="h-10 bg-muted/20 border-border focus:border-primary/40 text-[11px] font-bold px-4 rounded-xl placeholder:opacity-20 uppercase"
                                                    placeholder={`Enter link...`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-4 relative z-10">
                                    <Button
                                        onClick={() => handleUpdate("settings", { socials: data.settings.socials })}
                                        className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                                        disabled={saving}
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />} Save Socials
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
                                            ref={drawerRef}
                                            className="relative h-full w-full max-w-[600px] bg-card border-l border-border shadow-[-80px_0_150px_rgba(0,0,0,0.6)] flex flex-col"
                                        >
                                            <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
                                                        <Layout size={24} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary  leading-none">Group Settings</span>
                                                        <h4 className="text-2xl font-black uppercase tracking-tighter  leading-none mt-2 truncate max-w-[200px]">{editingFooterCluster.title}</h4>
                                                    </div>
                                                </div>
                                                <button onClick={() => setEditingFooterCluster(null)} className="w-14 h-14 bg-muted/20 border border-border rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-muted-foreground group">
                                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-muted/5 custom-scrollbar">
                                                <AutoScroller trigger={editingFooterCluster?.idx} />
                                                <div className="flex flex-col gap-4">
                                                    <label className="text-[10px] font-black uppercase text-primary  flex items-center gap-2">
                                                        <Tag size={12} /> Group Title
                                                    </label>
                                                    <Input
                                                        value={editingFooterCluster.title}
                                                        onChange={(e) => setEditingFooterCluster({ ...editingFooterCluster, title: e.target.value })}
                                                        className="h-16 border-border bg-background rounded-2xl text-lg font-black  px-6 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-6 p-8 rounded-[3rem] bg-muted/20 border border-border shadow-inner mt-4">
                                                    <div className="flex items-center justify-between px-2">
                                                        <span className="text-[11px] font-black uppercase tracking-widest  text-primary">Group Links</span>
                                                        <Button
                                                            onClick={() => {
                                                                const newLinks = [...editingFooterCluster.links, { name: "NEW LINK", href: "/" }]
                                                                setEditingFooterCluster({ ...editingFooterCluster, links: newLinks })
                                                            }}
                                                            className="h-10 px-5 rounded-xl bg-primary text-white font-black  uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20"
                                                        >
                                                            <Plus size={14} className="mr-2" /> Add Link Item
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-col gap-4">
                                                        {editingFooterCluster.links.map((link: any, lIdx: number) => (
                                                            <div key={lIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-background border border-border rounded-2xl shadow-sm hover:border-primary/40 transition-all group/link">
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[8px] font-black uppercase text-muted-foreground  px-2">Link Label</label>
                                                                    <Input
                                                                        value={link.name}
                                                                        onChange={(e) => {
                                                                            const newLinks = [...editingFooterCluster.links]
                                                                            newLinks[lIdx].name = e.target.value
                                                                            setEditingFooterCluster({ ...editingFooterCluster, links: newLinks })
                                                                        }}
                                                                        className="h-10 border-border text-[10px] font-black  bg-muted/5 rounded-xl px-4"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[8px] font-black uppercase text-muted-foreground  px-2">Destination URL</label>
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
                                                                <span className="text-[10px] font-black uppercase tracking-widest ">No Links Defined</span>
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
                                                    className="h-20 w-full rounded-3xl bg-foreground text-background font-black  tracking-widest uppercase text-sm hover:bg-primary hover:text-white transition-all shadow-2xl border-4 border-background ring-2 ring-foreground/10"
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
                                    <h2 className="text-4xl font-black  tracking-tighter uppercase leading-none">Site Pages</h2>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40  underline decoration-primary/30 underline-offset-4">Core legal and informational documents</span>
                                </div>
                                <Button
                                    onClick={() => handleCreate("pages", {
                                        title: "NEW PAGE",
                                        slug: "new-page",
                                        content: "PAGE CONTENT...",
                                        status: "DRAFT"
                                    })}
                                    className="h-16 px-10 rounded-2xl gap-3 font-black  tracking-widest uppercase text-xs shadow-2xl shadow-primary/30"
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
                                            <h4 className="text-2xl font-black uppercase tracking-tighter  leading-none truncate pr-12">{page.title}</h4>
                                            <span className="text-[10px] font-bold text-primary ">/{page.slug}</span>
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
                                    <h2 className="text-4xl font-black  tracking-tighter uppercase leading-none">Support Channels</h2>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40  underline decoration-primary/30 underline-offset-4">Physical and digital communication channels</span>
                                </div>
                                <Button
                                    onClick={() => handleUpdate("support", supportSettings)}
                                    disabled={saving}
                                    className="h-16 px-10 rounded-2xl gap-3 font-black  tracking-widest uppercase text-xs shadow-2xl shadow-primary/30"
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
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] ">Contact Information</span>
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
                                                    <label className="text-[11px] font-black uppercase tracking-widest opacity-40 ">{item.label}</label>
                                                </div>
                                                {item.textarea ? (
                                                    <textarea
                                                        value={supportSettings[item.id] || ""}
                                                        onChange={(e) => setSupportSettings({ ...supportSettings, [item.id]: e.target.value })}
                                                        className="w-full h-32 bg-background border border-border rounded-2xl px-6 py-5 text-xs font-bold uppercase  shadow-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none custom-scrollbar leading-relaxed"
                                                        placeholder={item.placeholder}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={supportSettings[item.id] || ""}
                                                        onChange={(e) => setSupportSettings({ ...supportSettings, [item.id]: e.target.value })}
                                                        className="h-16 border-border bg-background rounded-2xl px-6 font-bold  text-xs shadow-sm placeholder:opacity-20"
                                                        placeholder={item.placeholder}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. SOCIAL ORCHESTRATION CROSS-LINKING */}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* CATEGORY EDITOR DRAWER (Integrated) */}
            <AnimatePresence>
                {editingCategory && !editingCategory._type && (
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
                            ref={drawerRef}
                            className="relative h-full w-full lg:max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col"
                        >
                            <div className="p-8 md:p-10 border-b border-border bg-muted/30 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Category Management</span>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter truncate max-w-[300px]">{editingCategory.name || "NEW CATEGORY"}</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => {
                                            if (editingCategory.id) handleUpdate("categories", editingCategory);
                                            else handleCreate("categories", editingCategory);
                                            setEditingCategory(null);
                                        }}
                                        className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all"
                                    >
                                        <Save size={16} className="mr-2" /> SAVE
                                    </Button>
                                    <button onClick={() => setEditingCategory(null)} className="w-12 h-12 bg-muted/10 border border-border rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-10 space-y-10 overflow-y-auto no-scrollbar">
                                <AutoScroller trigger={editingCategory?.id || "new-category"} />
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase opacity-40">Category Name</label>
                                    <Input
                                        value={editingCategory.name || ""}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="h-12 border-border font-black text-xs uppercase"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase opacity-40">Visual Representation</label>
                                    <ImageManager
                                        label="Category Cover"
                                        value={editingCategory.imageUrl || ""}
                                        onChange={(val: string) => setEditingCategory({ ...editingCategory, imageUrl: val })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-2 p-4 rounded-2xl bg-muted/5 border border-border/50">
                                    <div className="flex items-center gap-4 px-1">
                                        <div className="flex flex-col min-w-[100px] flex-1">
                                            <span className="text-[9px] font-black uppercase tracking-tight">Active Status</span>
                                            <span className="text-[6px] opacity-30 uppercase font-black leading-none tracking-widest ">Live Storefront</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!editingCategory.isActive}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-2 border-primary/20 bg-muted/20 accent-primary cursor-pointer transition-all hover:scale-110"
                                        />
                                    </div>
                                </div>


                            </div>

                            <div className="p-10 border-t border-border bg-card">
                                <Button
                                    onClick={() => {
                                        if (editingCategory.id) {
                                            handleUpdate("categories", editingCategory);
                                        } else {
                                            handleCreate("categories", editingCategory);
                                        }
                                        setEditingCategory(null);
                                    }}
                                    className="h-16 w-full rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30"
                                >
                                    <Save size={16} className="mr-2" /> SAVE CATEGORY SETTINGS
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BRAND EDITOR DRAWER */}
            <AnimatePresence>
                {editingCategory?._type === 'brand' && (
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
                            ref={drawerRef}
                            className="relative h-full w-full lg:max-w-xl bg-card border-l border-border shadow-2xl flex flex-col"
                        >
                            <div className="p-8 md:p-10 border-b border-border bg-muted/30 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Brand Orchestration</span>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter truncate max-w-[250px]">{editingCategory.name || "NEW BRAND"}</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => {
                                            if (editingCategory.id) handleUpdate("brands", editingCategory);
                                            else handleCreate("brands", editingCategory);
                                            setEditingCategory(null);
                                        }}
                                        className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all"
                                    >
                                        <Save size={16} className="mr-2" /> SAVE
                                    </Button>
                                    <button onClick={() => setEditingCategory(null)} className="w-12 h-12 bg-muted/10 border border-border rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-10 space-y-10 overflow-y-auto no-scrollbar bg-muted/5">
                                <AutoScroller trigger={editingCategory?.id || "new-brand"} />
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase opacity-40">Official Identity (Name)</label>
                                    <Input
                                        value={editingCategory.name || ""}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="h-14 border-border font-black text-xs uppercase bg-background shadow-sm"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase opacity-40">Digital Asset (Logo)</label>
                                    <ImageManager
                                        label="Brand Logo"
                                        value={editingCategory.imageUrl || ""}
                                        onChange={(val: string) => setEditingCategory({ ...editingCategory, imageUrl: val })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2 p-6 rounded-3xl bg-white border border-border shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col flex-1 gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-tight">Active Status</span>
                                            <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest ">Visible in brand carousels</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!editingCategory.isActive}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                                            className="w-6 h-6 rounded-xl border-2 border-primary/20 bg-muted/20 accent-primary cursor-pointer transition-all hover:scale-110"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-border bg-card">
                                <Button
                                    onClick={() => {
                                        if (editingCategory.id) {
                                            handleUpdate("brands", editingCategory);
                                        } else {
                                            handleCreate("brands", editingCategory);
                                        }
                                        setEditingCategory(null);
                                    }}
                                    className="h-16 w-full rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30"
                                >
                                    <Save size={16} className="mr-2" /> FINALIZE BRAND
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
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
                            ref={drawerRef}
                            className="relative h-full w-full lg:max-w-[800px] bg-card border-l border-border shadow-[-40px_0_120px_rgba(0,0,0,0.5)] flex flex-col"
                        >
                            <div className="p-6 md:p-10 border-b border-border bg-muted/30 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 sticky top-0 z-50 backdrop-blur-xl">
                                <div className="flex items-center gap-4 lg:gap-6">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl">
                                        <Archive size={28} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary  leading-none">Page Settings</span>
                                        <h4 className="text-xl lg:text-3xl font-black uppercase tracking-tighter  leading-none mt-2 truncate max-w-[200px] lg:max-w-none">{editingCategory.title}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full lg:w-auto">
                                    <Button
                                        onClick={() => {
                                            handleUpdate("pages", editingCategory);
                                            setEditingCategory(null);
                                        }}
                                        className="h-12 lg:h-14 flex-1 lg:flex-none px-6 lg:px-8 rounded-2xl bg-primary text-white font-black  uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                                    >
                                        <Save size={16} className="mr-2" /> SAVE
                                    </Button>
                                    <button onClick={() => setEditingCategory(null)} className="w-12 h-12 lg:w-14 lg:h-14 bg-muted/20 border border-border rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 lg:p-12 space-y-10 lg:space-y-12 overflow-y-auto">
                                <AutoScroller trigger={editingCategory?.id || "new-page"} />
                                {/* Page Status Editor: Moved to Top */}
                                <div className="flex items-center justify-between p-8 bg-slate-950 text-white rounded-[2rem] shadow-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Visibility Terminal</span>
                                        <span className="text-xs font-black uppercase  tracking-tighter">Broadcast to Public Site?</span>
                                    </div>
                                    <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10 relative z-10">
                                        <button
                                            onClick={() => setEditingCategory({ ...editingCategory, status: "PUBLISHED" })}
                                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest  transition-all ${editingCategory.status === "PUBLISHED" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"}`}
                                        >
                                            PUBLISHED
                                        </button>
                                        <button
                                            onClick={() => setEditingCategory({ ...editingCategory, status: "DRAFT" })}
                                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest  transition-all ${editingCategory.status === "DRAFT" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"}`}
                                        >
                                            DRAFT
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase opacity-40 ">Page Title</label>
                                        <Input
                                            value={editingCategory.title}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                                            className="h-12 border-border font-black text-sm uppercase "
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase opacity-40 ">URL Slug</label>
                                        <Input
                                            value={editingCategory.slug}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                            className="h-12 border-border font-bold text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 ">Narrative Content</label>
                                        <div className="flex gap-2">
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-20 ">Draft Supported</span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={editingCategory.content}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, content: e.target.value })}
                                        className="w-full h-[400px] bg-muted/20 border border-border rounded-3xl p-10 text-xs font-medium focus:ring-1 focus:ring-primary outline-none custom-scrollbar leading-relaxed"
                                        placeholder="Enter content here..."
                                    />
                                </div>

                                <div className="space-y-8 bg-muted/30 p-10 rounded-[2.5rem] border border-border shadow-inner">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Activity size={18} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] ">Search Engine Optimization (SEO)</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase opacity-40 ">SEO Title</label>
                                            <Input
                                                value={editingCategory.seoTitle || ""}
                                                onChange={(e) => setEditingCategory({ ...editingCategory, seoTitle: e.target.value })}
                                                className="h-12 bg-card border-border px-6 text-[11px] font-bold"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase opacity-40 ">SEO Description</label>
                                            <textarea
                                                value={editingCategory.seoDescription || ""}
                                                onChange={(e) => setEditingCategory({ ...editingCategory, seoDescription: e.target.value })}
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
