"use client"

import React, { useState, useEffect } from "react"
import {
    Plus, Search, Filter, Smartphone,
    MoreHorizontal, Edit2, Trash2, Eye,
    ArrowUpRight, Package, Smartphone as SmartphoneIcon,
    Tags, Layers, ShieldCheck, Zap, X, Image as ImageIcon,
    ChevronDown, ChevronUp, Save, BarChart3, Shield, Download, Info, Globe, Ruler
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Oppo", "Infinix", "Tecno", "Google", "Huawei", "Nothing", "OnePlus"]
const CATEGORIES = ["Smartphones", "Foldables", "Tablets", "Accessories", "Refurbished"]
const OS_TYPES = ["iOS", "Android", "HarmonyOS", "Other"]
const DISPLAY_TYPES = ["OLED", "AMOLED", "Super AMOLED", "LTPO OLED", "LCD", "IPS LCD", "IPS", "Liquid Retina"]
const FIELD_TYPES = ["Text", "Number", "Dropdown", "Boolean", "Multi-select"]

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedBrand, setSelectedBrand] = useState("All Brands")
    const [activeModalTab, setActiveModalTab] = useState("Overview")
    const [expandedSections, setExpandedSections] = useState<string[]>(["basic", "images"])
    const router = useRouter()

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        )
    }

    const addCustomField = (sectionId: string) => {
        const fields = newProduct.customSpecifications[sectionId] || []
        setNewProduct({
            ...newProduct,
            customSpecifications: {
                ...newProduct.customSpecifications,
                [sectionId]: [...fields, { field_name: "", field_type: "Text", value: "" }]
            }
        })
    }

    const updateCustomField = (sectionId: string, index: number, key: string, val: any) => {
        const fields = [...(newProduct.customSpecifications[sectionId] || [])]
        // Duplicate check for field_name
        if (key === 'field_name') {
            const exists = fields.some((f, i) => i !== index && f.field_name.toLowerCase() === val.toLowerCase())
            if (exists && val !== "") return toast.error("Duplicate field name in this section")
        }
        fields[index] = { ...fields[index], [key]: val }
        setNewProduct({
            ...newProduct,
            customSpecifications: {
                ...newProduct.customSpecifications,
                [sectionId]: fields
            }
        })
    }

    const removeCustomField = (sectionId: string, index: number) => {
        const fields = [...(newProduct.customSpecifications[sectionId] || [])]
        fields.splice(index, 1)
        setNewProduct({
            ...newProduct,
            customSpecifications: {
                ...newProduct.customSpecifications,
                [sectionId]: fields
            }
        })
    }

    const addCustomSection = () => {
        const id = `custom_${Date.now()}`
        setNewProduct({
            ...newProduct,
            customSections: [
                ...newProduct.customSections,
                { id, title: "New Section", icon: "Package", fields: [{ field_name: "", field_type: "Text", value: "" }] }
            ]
        })
        setExpandedSections(prev => [...prev, id])
    }

    const removeCustomSection = (id: string) => {
        setNewProduct({
            ...newProduct,
            customSections: newProduct.customSections.filter(s => s.id !== id)
        })
    }

    const updateCustomSection = (id: string, updates: any) => {
        setNewProduct({
            ...newProduct,
            customSections: newProduct.customSections.map(s => s.id === id ? { ...s, ...updates } : s)
        })
    }

    const handleExport = () => {
        const toastId = toast.loading("Preparing product list...")
        setTimeout(() => {
            const headers = "ID,Name,Brand,Category,Price,Stock\n"
            const rows = products.map(p => `${p.id},"${p.name}",${p.brand},${p.category},${p.price},${p.stock}`).join("\n")
            const blob = new Blob([headers + rows], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.setAttribute("hidden", "")
            a.setAttribute("href", url)
            a.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            toast.success("Products exported successfully", { id: toastId })
        }, 1500)
    }

    const handleFilterClick = () => {
        toast("Advanced filtering options coming soon.", { icon: "🔍" })
    }

    const initialProductState = {
        brand: "Apple",
        model: "",
        releaseYear: new Date().getFullYear().toString(),
        color: "",
        price: "",
        discountPrice: "",
        stock: "",
        sku: "",
        condition: "New",
        isFeatured: false,
        description: "",
        category: "Smartphones",
        images: [] as string[],
        // Specifications Categories
        os: "Android",
        osVersion: "",
        displaySize: "",
        displayType: "OLED",
        resolution: "",
        refreshRate: "",
        protection: "",
        chipset: "",
        gpu: "",
        ram: "",
        storage: "", // Will treat as comma separated for now
        expandable: false,
        expandableCapacity: "",
        cameraMain: "",
        cameraUW: "",
        cameraTele: "",
        cameraFront: "",
        cameraVideo: "",
        cameraFeatures: "",
        batteryCapacity: "",
        chargingSpeed: "",
        wirelessCharging: false,
        reverseCharging: false,
        simType: "Dual SIM",
        network: "5G",
        wifi: "",
        bluetooth: "",
        nfc: false,
        usbType: "USB-C",
        dimensions: "",
        weight: "",
        material: "",
        ipRating: "",
        availableColors: "",
        customSpecifications: {} as Record<string, { field_name: string, field_type: string, value: any }[]>,
        customSections: [] as { id: string, title: string, icon: string, fields: { field_name: string, field_type: string, value: any }[] }[],
        variants: [] as { id: string, color: string, stock: string, price: string, images: string[] }[]
    }

    const [newProduct, setNewProduct] = useState(initialProductState)

    const handleOpenAddModal = () => {
        setEditingProduct(null)
        setNewProduct(initialProductState)
        setIsAddModalOpen(true)
    }

    const handleOpenEditModal = (product: any) => {
        setEditingProduct(product)
        // Map product.specs back to newProduct state
        const s = product.specs || {}
        setNewProduct({
            brand: product.brand || "",
            model: (product.name || "").replace(product.brand || "", "").trim(),
            releaseYear: s.identity?.releaseYear || "",
            color: s.identity?.color || "",
            price: String(product.price || ""),
            discountPrice: s.identity?.discountPrice || "",
            stock: String(product.stock || ""),
            sku: s.identity?.sku || "",
            condition: s.identity?.condition || "New",
            isFeatured: s.identity?.isFeatured || false,
            description: product.description || "",
            category: product.category || "Smartphones",
            images: s.gallery || (product.image ? [product.image] : []),
            displaySize: s.display?.size || "",
            displayType: s.display?.type || "",
            resolution: s.display?.resolution || "",
            refreshRate: s.display?.refreshRate || "",
            protection: s.display?.protection || "",
            os: s.performance?.os || "Android",
            osVersion: s.performance?.osVersion || "",
            chipset: s.performance?.chipset || "",
            gpu: s.performance?.gpu || "",
            ram: s.performance?.ram || "",
            storage: s.performance?.storage || "",
            expandable: s.performance?.expandable || false,
            expandableCapacity: s.performance?.expandableCapacity || "",
            cameraMain: s.camera?.main || "",
            cameraUW: s.camera?.ultraWide || "",
            cameraTele: s.camera?.telephoto || "",
            cameraFront: s.camera?.front || "",
            cameraVideo: s.camera?.video || "",
            cameraFeatures: s.camera?.features || "",
            batteryCapacity: s.battery?.capacity || "",
            chargingSpeed: s.battery?.chargingSpeed || "",
            wirelessCharging: s.battery?.wireless || false,
            reverseCharging: s.battery?.reverse || false,
            simType: s.connectivity?.simType || "Dual SIM",
            network: s.connectivity?.network || "5G",
            wifi: s.connectivity?.wifi || "",
            bluetooth: s.connectivity?.bluetooth || "",
            nfc: s.connectivity?.nfc || false,
            usbType: s.connectivity?.usbType || "USB-C",
            weight: s.physical?.weight || "",
            dimensions: s.physical?.dimensions || "",
            material: s.physical?.material || "",
            ipRating: s.physical?.ipRating || "",
            availableColors: s.identity?.color || "",
            customSpecifications: s.customSpecifications || {},
            customSections: s.customSections || [],
            variants: product.variants?.map((v: any) => ({
                id: v.id,
                color: v.color || "",
                stock: String(v.stock || "0"),
                price: v.price ? String(v.price) : "",
                images: v.images ? typeof v.images === 'string' ? JSON.parse(v.images) : v.images : []
            })) || []
        })
        setIsAddModalOpen(true)
    }

    const [isUploading, setIsUploading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        if (isRefreshing) return
        setIsLoading(true)
        setIsRefreshing(true)
        try {
            const res = await fetch("/api/products")
            const data = await res.json()
            // Deduplicate products by ID just in case the API returns duplicates
            const uniqueProducts = Array.from(new Map(data.map((item: any) => [item.id, item])).values())
            setProducts(uniqueProducts)
        } catch (error) {
            toast.error("Failed to sync products")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const uploadFiles = async (files: FileList | File[], variantId?: string) => {
        if (!files || files.length === 0) return

        setIsUploading(true)
        const toastId = toast.loading("Uploading images...")

        try {
            const formData = new FormData()
            Array.from(files).forEach(file => {
                if (file.size > 5 * 1024 * 1024) throw new Error(`Image ${file.name} exceeds 5MB limit.`)
                formData.append('file', file)
            })

            const res = await fetch("/api/upload", { method: "POST", body: formData })
            const data = await res.json()
            if (!data.success) throw new Error(data.error || "Upload failed")

            if (variantId) {
                setNewProduct(prev => ({
                    ...prev,
                    variants: prev.variants.map(v => v.id === variantId ? { ...v, images: [...v.images, ...data.urls] } : v)
                }))
            } else {
                setNewProduct(prev => ({ ...prev, images: [...prev.images, ...data.urls] as any }))
            }

            toast.success(`${data.urls.length} images uploaded successfully`, { id: toastId })
        } catch (error: any) {
            console.error("Product upload failed:", error)
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
                    const file = new File([blob], `pasted_image_${Date.now()}.png`, { type: blob.type });
                    files.push(file)
                }
            }
        }
        if (files.length > 0) {
            e.preventDefault()
            await uploadFiles(files)
        }
    }

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isUploading || isSaving) return

        setIsSaving(true)
        const saveToast = toast.loading(editingProduct ? "Updating product..." : "Saving product...")
        try {
            const payload = {
                name: `${newProduct.brand} ${newProduct.model}`,
                description: newProduct.description,
                brand: newProduct.brand,
                category: newProduct.category,
                price: parseFloat(newProduct.price) || 0,
                stock: parseInt(newProduct.stock) || 0,
                image: newProduct.images[0] || "/images/placeholder.png",
                specs: {
                    identity: {
                        releaseYear: newProduct.releaseYear,
                        color: newProduct.color,
                        sku: newProduct.sku,
                        condition: newProduct.condition,
                        discountPrice: newProduct.discountPrice,
                        isFeatured: newProduct.isFeatured
                    },
                    display: {
                        size: newProduct.displaySize,
                        type: newProduct.displayType,
                        resolution: newProduct.resolution,
                        refreshRate: newProduct.refreshRate,
                        protection: newProduct.protection
                    },
                    performance: {
                        os: newProduct.os,
                        osVersion: newProduct.osVersion,
                        chipset: newProduct.chipset,
                        gpu: newProduct.gpu,
                        ram: newProduct.ram,
                        storage: newProduct.storage,
                        expandable: newProduct.expandable,
                        expandableCapacity: newProduct.expandableCapacity
                    },
                    camera: {
                        main: newProduct.cameraMain,
                        ultraWide: newProduct.cameraUW,
                        telephoto: newProduct.cameraTele,
                        front: newProduct.cameraFront,
                        video: newProduct.cameraVideo,
                        features: newProduct.cameraFeatures
                    },
                    battery: {
                        capacity: newProduct.batteryCapacity,
                        chargingSpeed: newProduct.chargingSpeed,
                        wireless: newProduct.wirelessCharging,
                        reverse: newProduct.reverseCharging
                    },
                    connectivity: {
                        simType: newProduct.simType,
                        network: newProduct.network,
                        wifi: newProduct.wifi,
                        bluetooth: newProduct.bluetooth,
                        nfc: newProduct.nfc,
                        usbType: newProduct.usbType
                    },
                    physical: {
                        weight: newProduct.weight,
                        dimensions: newProduct.dimensions,
                        material: newProduct.material,
                        ipRating: newProduct.ipRating
                    },
                    gallery: newProduct.images,
                    customSpecifications: newProduct.customSpecifications,
                    customSections: newProduct.customSections
                },
                variants: newProduct.variants.map(v => ({
                    id: v.id.startsWith('new_') ? undefined : v.id,
                    color: v.color,
                    stock: parseInt(v.stock) || 0,
                    price: v.price ? parseFloat(v.price) : null,
                    images: v.images
                }))
            }

            const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products"
            const method = editingProduct ? "PATCH" : "POST"

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(editingProduct ? "Product Updated" : "Product Saved", { id: saveToast })
                setIsAddModalOpen(false)
                fetchProducts()
            } else {
                throw new Error("Failed to save")
            }
        } catch (error) {
            toast.error("Process failed", { id: saveToast })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteProduct = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return

        const deleteToast = toast.loading("Deleting product...")
        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Product deleted successfully", { id: deleteToast })
                fetchProducts()
            } else {
                throw new Error("Delete failed")
            }
        } catch (error) {
            toast.error("Delete failed", { id: deleteToast })
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Product Management</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Manage your models, stock, and pricing details.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-border font-black italic tracking-widest uppercase text-[10px] gap-2 hover:bg-muted transition-all"
                    >
                        <Download size={18} />
                        EXPORT PRODUCTS
                    </Button>
                    <Button
                        onClick={handleOpenAddModal}
                        className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        ADD NEW PRODUCT
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Products", value: products.length, icon: <SmartphoneIcon className="text-primary" />, bg: "bg-primary/5" },
                    { label: "Stock Value", value: "$458.2K", icon: <BarChart3 className="text-primary" />, bg: "bg-primary/5" },
                    { label: "Active Warranties", value: "842", icon: <ShieldCheck className="text-primary" />, bg: "bg-primary/5" },
                    { label: "Low Stock Items", value: "15", icon: <Package className="text-primary" />, bg: "bg-primary/5" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className={cn("p-3 w-fit rounded-xl transition-colors group-hover:bg-primary/20", stat.bg)}>
                            {stat.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                            <span className="text-2xl font-black italic tracking-tighter text-foreground">{stat.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search products or models..."
                        className="w-full h-12 bg-muted rounded-xl pl-12 pr-4 outline-none border border-transparent focus:border-primary/20 focus:bg-card transition-all text-sm font-medium text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                    <select
                        className="h-12 px-4 bg-muted rounded-xl border border-border outline-none text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:border-primary/50 transition-all cursor-pointer"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                        <option>All Brands</option>
                        {BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    <Button
                        onClick={handleFilterClick}
                        variant="outline"
                        className="h-12 rounded-xl border-border gap-2 font-black italic tracking-widest uppercase px-4 text-[10px]"
                    >
                        <Filter size={18} />
                        Filters
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-8 py-6 w-24">Image</th>
                                <th className="px-8 py-6">Product Name</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Stock Level</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 animate-pulse">
                                            <Zap className="w-10 h-10 text-primary opacity-30" />
                                            <span className="text-xs font-black uppercase text-muted-foreground tracking-[0.3em]">Loading products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Smartphone size={40} className="text-muted-foreground" />
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">No products found</span>
                                            <Button variant="link" onClick={() => setIsAddModalOpen(true)} className="text-primary font-black italic tracking-widest uppercase text-[10px]">Add One Now</Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-muted/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="h-16 w-16 bg-muted rounded-xl relative overflow-hidden border border-border">
                                                <Image src={p.image || "/images/product-placeholder.png"} fill alt="P" className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-primary leading-none">{p.brand}</span>
                                                    {p.isNew && <span className="bg-primary text-[8px] text-primary-foreground px-1.5 py-0.5 rounded font-black italic">NEW</span>}
                                                </div>
                                                <span className="text-sm font-black text-foreground tracking-tight mt-1">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">{p.category}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex -space-x-1.5">
                                                <div className="h-6 px-2 flex items-center justify-center rounded-lg bg-muted border border-border text-[8px] font-black italic uppercase">128G</div>
                                                <div className="h-6 px-2 flex items-center justify-center rounded-lg bg-muted border border-border text-[8px] font-black italic uppercase">256G</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                <div className="flex justify-between items-center text-[10px] font-black italic uppercase">
                                                    <span className="text-muted-foreground">Stock</span>
                                                    <span className="text-primary">{p.stock} Units</span>
                                                </div>
                                                <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-1000 bg-primary", p.stock < 10 && "opacity-60")}
                                                        style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/products/${p.id}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5">
                                                        <Globe size={18} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5"
                                                    onClick={() => handleOpenEditModal(p)}
                                                >
                                                    <Edit2 size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10"
                                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-6xl max-h-[96vh] sm:max-h-[90vh] bg-card border border-border/50 rounded-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="px-4 lg:px-10 py-4 lg:py-8 border-b border-border/30 flex items-center justify-between bg-muted/[0.02]">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg lg:text-2xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                                        {editingProduct ? `Edit ${editingProduct.brand}` : "Add New Product"}
                                    </h2>
                                    <span className="text-[8px] lg:text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] leading-none opacity-60">
                                        {editingProduct ? `Refining ${editingProduct.model}` : "Enter product details"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={handleSaveProduct}
                                        className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                                        disabled={isUploading || isSaving}
                                    >
                                        {isSaving ? "SAVING..." : (editingProduct ? "UPDATE PRODUCT" : "SAVE PRODUCT")}
                                    </Button>
                                    <button onClick={() => setIsAddModalOpen(false)} className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 lg:p-10 no-scrollbar bg-muted/[0.01]" onPaste={handlePaste}>
                                <form id="hardware-form" onSubmit={handleSaveProduct} className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
                                    <div className="flex flex-col gap-6">
                                        <button type="button" onClick={() => toggleSection("basic")} className="flex items-center gap-4 group text-left">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                <Info size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic">1. Basic Information</h3>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Essential details like brand, model, and price</span>
                                            </div>
                                            <div className="h-px flex-1 bg-border/20 ml-2" />
                                            {expandedSections.includes("basic") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {expandedSections.includes("basic") && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-8 overflow-hidden">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Brand</label>
                                                        <select value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="h-10 bg-muted/40 border border-border/30 rounded-xl px-4 text-[10px] font-bold outline-none">
                                                            {BRANDS.map(b => <option key={b}>{b}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-2 md:col-span-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Model Name</label>
                                                        <Input required value={newProduct.model} onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} placeholder="e.g. iPhone 16 Pro Max" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black uppercase tracking-widest" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Release Year</label>
                                                        <Input value={newProduct.releaseYear} onChange={(e) => setNewProduct({ ...newProduct, releaseYear: e.target.value })} placeholder="2024" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Category</label>
                                                        <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="h-10 bg-muted/40 border border-border/30 rounded-xl px-4 text-[10px] font-bold outline-none">
                                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Condition</label>
                                                        <select value={newProduct.condition} onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })} className="h-10 bg-muted/40 border border-border/30 rounded-xl px-4 text-[10px] font-bold outline-none">
                                                            <option>New</option>
                                                            <option>Refurbished</option>
                                                            <option>Open Box</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Color</label>
                                                        <Input value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} placeholder="Titanium Black" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">SKU</label>
                                                        <Input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="SH-101-BLK" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Price ($)</label>
                                                        <Input required type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="999" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Stock</label>
                                                        <Input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="50" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 mt-auto h-10">
                                                        <input type="checkbox" checked={newProduct.isFeatured} onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })} className="w-4 h-4 accent-primary" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Featured Product</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Description</label>
                                                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="min-h-[100px] bg-muted/30 border border-border/20 rounded-[1.5rem] p-5 text-xs font-medium focus:border-primary/30 outline-none resize-none" />
                                                </div>

                                                {(newProduct.customSpecifications['basic'] || []).map((cf, idx) => (
                                                    <div key={idx} className="flex flex-col gap-2 relative group/field">
                                                        <div className="flex items-center justify-between ml-2">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input
                                                                    className="text-[9px] font-black uppercase tracking-[0.1em] text-primary bg-transparent outline-none w-full placeholder:text-primary/20 italic"
                                                                    value={cf.field_name}
                                                                    onChange={(e) => updateCustomField('basic', idx, 'field_name', e.target.value)}
                                                                    placeholder="NEW ATTRIBUTE"
                                                                />
                                                                <select
                                                                    value={cf.field_type}
                                                                    onChange={(e) => updateCustomField('basic', idx, 'field_type', e.target.value)}
                                                                    className="text-[7px] font-black bg-muted border border-border/10 rounded px-1 py-0.5 outline-none uppercase opacity-30 hover:opacity-100 transition-opacity"
                                                                >
                                                                    {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                                                                </select>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCustomField('basic', idx)}
                                                                className="text-destructive/50 hover:text-destructive opacity-0 group-hover/field:opacity-100 transition-all mr-1"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                        {cf.field_type === 'Boolean' ? (
                                                            <div className="flex items-center gap-3 h-10 px-4 bg-muted/20 border border-border/30 rounded-xl">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!cf.value}
                                                                    onChange={(e) => updateCustomField('basic', idx, 'value', e.target.checked)}
                                                                    className="w-4 h-4 accent-primary"
                                                                />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground opacity-70">Enabled</span>
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                type={cf.field_type === 'Number' ? 'number' : 'text'}
                                                                value={cf.value}
                                                                onChange={(e) => updateCustomField('basic', idx, 'value', e.target.value)}
                                                                placeholder="Enter value..."
                                                                className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black"
                                                            />
                                                        )}
                                                    </div>
                                                ))}

                                                <button type="button" onClick={() => addCustomField('basic')} className="h-10 border-2 border-dashed border-border/20 rounded-xl flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all text-[9px] font-black uppercase tracking-widest text-muted-foreground group">
                                                    <Plus size={14} className="group-hover:text-primary" />
                                                    <span className="group-hover:text-primary">Add Custom Detail</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <button type="button" onClick={() => toggleSection("variants")} className="flex items-center gap-4 group text-left">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                <Layers size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic">2. Product Variants</h3>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Add different colors, specs, and price overrides</span>
                                            </div>
                                            <div className="h-px flex-1 bg-border/20 ml-2" />
                                            {expandedSections.includes("variants") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {expandedSections.includes("variants") && (
                                            <motion.div initial={{ opacity: 0, height: "auto" }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-6">
                                                {newProduct.variants.map((variant, vIdx) => (
                                                    <div key={variant.id} className="p-4 border border-border/30 rounded-2xl bg-muted/10 relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct({ ...newProduct, variants: newProduct.variants.filter(v => v.id !== variant.id) })}
                                                            className="absolute top-4 right-4 text-destructive opacity-50 hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Color / Variant Name</label>
                                                                <Input value={variant.color} onChange={(e) => {
                                                                    const nv = [...newProduct.variants]; nv[vIdx].color = e.target.value; setNewProduct({ ...newProduct, variants: nv });
                                                                }} placeholder="Midnight Black" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Price Override ($)</label>
                                                                <Input type="number" value={variant.price || ''} onChange={(e) => {
                                                                    const nv = [...newProduct.variants]; nv[vIdx].price = e.target.value; setNewProduct({ ...newProduct, variants: nv });
                                                                }} placeholder="Leave blank for default" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Stock Details</label>
                                                                <Input required type="number" value={variant.stock} onChange={(e) => {
                                                                    const nv = [...newProduct.variants]; nv[vIdx].stock = e.target.value; setNewProduct({ ...newProduct, variants: nv });
                                                                }} placeholder="10" className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black" />
                                                            </div>
                                                        </div>

                                                        {/* Images for variant */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Variant Images</label>
                                                            <div className="flex flex-wrap gap-4 items-center">
                                                                <label className="cursor-pointer">
                                                                    <div className="h-16 w-16 border-2 border-dashed border-border/30 rounded-xl flex items-center justify-center hover:bg-primary/5 hover:border-primary/50 transition-all text-muted-foreground">
                                                                        <Plus size={20} />
                                                                    </div>
                                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                                                                        if (e.target.files) {
                                                                            uploadFiles(e.target.files, variant.id);
                                                                            e.target.value = "";
                                                                        }
                                                                    }} />
                                                                </label>
                                                                {variant.images.map((img, iIdx) => (
                                                                    <div key={iIdx} className="h-16 w-16 relative rounded-xl overflow-hidden border border-border group/img">
                                                                        <Image src={img} fill className="object-cover" alt="product variant" />
                                                                        <button type="button" onClick={() => {
                                                                            const nv = [...newProduct.variants]; nv[vIdx].images.splice(iIdx, 1); setNewProduct({ ...newProduct, variants: nv });
                                                                        }} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all text-white">
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => setNewProduct({
                                                        ...newProduct,
                                                        variants: [...newProduct.variants, { id: `new_${Date.now()}`, color: "", stock: "0", price: "", images: [] }]
                                                    })}
                                                    className="h-12 border-2 border-dashed border-border/20 rounded-xl flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                                                >
                                                    <Plus size={16} /> Add Variant Option
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <button type="button" onClick={() => toggleSection("images")} className="flex items-center gap-4 group text-left">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                <ImageIcon size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic">3. Product Images</h3>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Upload at least one high-quality photo</span>
                                            </div>
                                            <div className="h-px flex-1 bg-border/20 ml-2" />
                                            {expandedSections.includes("images") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {expandedSections.includes("images") && (
                                            <motion.div initial={{ opacity: 0, height: "auto" }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-4">
                                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                    {newProduct.images.map((url, i) => (
                                                        <div key={i} className="aspect-square relative rounded-xl overflow-hidden border border-border group">
                                                            <Image src={url} fill className="object-cover" alt="product" />
                                                            <button type="button" onClick={() => { const imgs = [...newProduct.images]; imgs.splice(i, 1); setNewProduct({ ...newProduct, images: imgs }) }} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                                <Trash2 size={16} className="text-white" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label
                                                        htmlFor="product-image-upload"
                                                        className="aspect-square rounded-xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground group/upload"
                                                    >
                                                        <Plus size={24} className="group-hover/upload:text-primary transition-colors" />
                                                        <span className="text-[8px] font-black uppercase group-hover/upload:text-primary transition-colors">Upload</span>
                                                        <input
                                                            id="product-image-upload"
                                                            type="file"
                                                            multiple
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Specifications Sections */}
                                    {[
                                        {
                                            id: 'general', title: 'General Specifications', icon: <Globe size={18} />, fields: [
                                                { label: 'OS Type', type: 'select', options: OS_TYPES, key: 'os' },
                                                { label: 'OS Version', type: 'text', key: 'osVersion', placeholder: 'e.g. Android 14' }
                                            ]
                                        },
                                        {
                                            id: 'display', title: 'Display Portfolio', icon: <Layers size={18} />, fields: [
                                                { label: 'Screen Size (In)', type: 'number', key: 'displaySize', placeholder: '6.7' },
                                                { label: 'Display Type', type: 'select', options: DISPLAY_TYPES, key: 'displayType' },
                                                { label: 'Resolution', type: 'text', key: 'resolution', placeholder: '1290 x 2796' },
                                                { label: 'Refresh Rate (Hz)', type: 'number', key: 'refreshRate', placeholder: '120' },
                                                { label: 'Protection', type: 'text', key: 'protection', placeholder: 'Ceramic Shield' },
                                            ]
                                        },
                                        {
                                            id: 'performance', title: 'Performance Core', icon: <Zap size={18} />, fields: [
                                                { label: 'Chipset', type: 'text', key: 'chipset', placeholder: 'Apple A18 Pro' },
                                                { label: 'GPU', type: 'text', key: 'gpu', placeholder: 'Apple GPU (6-core)' },
                                                { label: 'RAM (GB)', type: 'number', key: 'ram', placeholder: '8' },
                                                { label: 'Storage Options', type: 'text', key: 'storage', placeholder: '128GB, 256GB...' },
                                                { label: 'Expandable?', type: 'boolean', key: 'expandable' },
                                                { label: 'Max Capacity', type: 'text', key: 'expandableCapacity', placeholder: '1TB', condition: newProduct.expandable },
                                            ]
                                        },
                                        {
                                            id: 'camera', title: 'Optical Sensors', icon: <Smartphone size={18} />, fields: [
                                                { label: 'Rear Setup', type: 'text', key: 'cameraMain', placeholder: '48MP Main' },
                                                { label: 'Ultra-Wide', type: 'text', key: 'cameraUW', placeholder: '12MP UW' },
                                                { label: 'Telephoto', type: 'text', key: 'cameraTele', placeholder: '12MP 5x' },
                                                { label: 'Front Camera', type: 'text', key: 'cameraFront', placeholder: '12MP TrueDepth' },
                                                { label: 'Video Logic', type: 'text', key: 'cameraVideo', placeholder: '4K @ 60fps' },
                                                { label: 'Features', type: 'text', key: 'cameraFeatures', placeholder: 'ProRAW, Night Mode' },
                                            ]
                                        },
                                        {
                                            id: 'battery', title: 'Energy Matrix', icon: <Zap size={18} />, fields: [
                                                { label: 'Capacity (mAh)', type: 'number', key: 'batteryCapacity', placeholder: '4422' },
                                                { label: 'Charging (W)', type: 'number', key: 'chargingSpeed', placeholder: '30' },
                                                { label: 'Wireless?', type: 'boolean', key: 'wirelessCharging' },
                                                { label: 'Reverse?', type: 'boolean', key: 'reverseCharging' },
                                            ]
                                        },
                                        {
                                            id: 'connectivity', title: 'IO & Connectivity', icon: <Globe size={18} />, fields: [
                                                { label: 'SIM Type', type: 'text', key: 'simType', placeholder: 'Nano-SIM / eSIM' },
                                                { label: 'Network', type: 'select', options: ['4G', '5G'], key: 'network' },
                                                { label: 'Wi-Fi Protocol', type: 'text', key: 'wifi', placeholder: 'Wi-Fi 7' },
                                                { label: 'Bluetooth', type: 'text', key: 'bluetooth', placeholder: '5.3' },
                                                { label: 'NFC Support', type: 'boolean', key: 'nfc' },
                                                { label: 'USB Protocol', type: 'text', key: 'usbType', placeholder: 'USB-C 3.2' },
                                            ]
                                        },
                                        {
                                            id: 'design', title: 'Build & Aesthetics', icon: <Ruler size={18} />, fields: [
                                                { label: 'Dimensions', type: 'text', key: 'dimensions', placeholder: '159.9 x 76.7 x 8.3 mm' },
                                                { label: 'Weight (g)', type: 'number', key: 'weight', placeholder: '221' },
                                                { label: 'Material', type: 'text', key: 'material', placeholder: 'Titanium / Glass' },
                                                { label: 'IP Rating', type: 'text', key: 'ipRating', placeholder: 'IP68' },
                                                { label: 'Available Colors', type: 'text', key: 'availableColors', placeholder: 'Black, White, Blue' },
                                            ]
                                        }
                                    ].map((section) => (
                                        <div key={section.id} className="flex flex-col gap-6">
                                            <button type="button" onClick={() => toggleSection(section.id)} className="flex items-center gap-4 group text-left">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                    {section.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic">{section.title}</h3>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Manage hardware metrics for this category</span>
                                                </div>
                                                <div className="h-px flex-1 bg-border/20 ml-2" />
                                                {expandedSections.includes(section.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>

                                            {expandedSections.includes(section.id) && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
                                                    {section.fields.map((f: any) => (
                                                        (f.condition === undefined || f.condition === true) && (
                                                            <div key={f.key} className="flex flex-col gap-2">
                                                                <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">{f.label}</label>
                                                                {f.type === 'select' ? (
                                                                    <select
                                                                        value={(newProduct as any)[f.key]}
                                                                        onChange={(e) => setNewProduct({ ...newProduct, [f.key]: e.target.value })}
                                                                        className="h-10 bg-muted/40 border border-border/30 rounded-xl px-4 text-[10px] font-bold outline-none"
                                                                    >
                                                                        {f.options.map((opt: string) => <option key={opt}>{opt}</option>)}
                                                                    </select>
                                                                ) : f.type === 'boolean' ? (
                                                                    <div className="flex items-center gap-3 h-10 px-4 bg-muted/20 border border-border/30 rounded-xl">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(newProduct as any)[f.key]}
                                                                            onChange={(e) => setNewProduct({ ...newProduct, [f.key]: e.target.checked })}
                                                                            className="w-4 h-4 accent-primary"
                                                                        />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground opacity-70">Enabled</span>
                                                                    </div>
                                                                ) : (
                                                                    <Input
                                                                        type={f.type}
                                                                        value={(newProduct as any)[f.key]}
                                                                        onChange={(e) => setNewProduct({ ...newProduct, [f.key]: e.target.value })}
                                                                        placeholder={f.placeholder}
                                                                        className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black"
                                                                    />
                                                                )}
                                                            </div>
                                                        )
                                                    ))}

                                                    {/* Custom Fields in this Section */}
                                                    {(newProduct.customSpecifications[section.id] || []).map((cf, idx) => (
                                                        <div key={idx} className="flex flex-col gap-2 relative group/field">
                                                            <div className="flex items-center justify-between ml-2">
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <input
                                                                        className="text-[9px] font-black uppercase tracking-[0.1em] text-primary bg-transparent outline-none w-full placeholder:text-primary/20 italic"
                                                                        value={cf.field_name}
                                                                        onChange={(e) => updateCustomField(section.id, idx, 'field_name', e.target.value)}
                                                                        placeholder="FIELD NAME"
                                                                    />
                                                                    <select
                                                                        value={cf.field_type}
                                                                        onChange={(e) => updateCustomField(section.id, idx, 'field_type', e.target.value)}
                                                                        className="text-[7px] font-black bg-muted border border-border/10 rounded px-1 py-0.5 outline-none uppercase opacity-30 hover:opacity-100 transition-opacity"
                                                                    >
                                                                        {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCustomField(section.id, idx)}
                                                                    className="text-destructive/50 hover:text-destructive opacity-0 group-hover/field:opacity-100 transition-all mr-1"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </div>
                                                            {cf.field_type === 'Boolean' ? (
                                                                <div className="flex items-center gap-3 h-10 px-4 bg-muted/20 border border-border/30 rounded-xl">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!cf.value}
                                                                        onChange={(e) => updateCustomField(section.id, idx, 'value', e.target.checked)}
                                                                        className="w-4 h-4 accent-primary"
                                                                    />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground opacity-70">Enabled</span>
                                                                </div>
                                                            ) : (
                                                                <Input
                                                                    type={cf.field_type === 'Number' ? 'number' : 'text'}
                                                                    value={cf.value}
                                                                    onChange={(e) => updateCustomField(section.id, idx, 'value', e.target.value)}
                                                                    placeholder="Enter value..."
                                                                    className="h-10 bg-muted/30 border-border/20 rounded-xl text-[10px] font-black"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        onClick={() => addCustomField(section.id)}
                                                        className="h-20 border-2 border-dashed border-border/20 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-primary/40 hover:bg-primary/5 transition-all text-[9px] font-black uppercase tracking-widest text-muted-foreground group mt-1"
                                                    >
                                                        <Plus size={16} className="group-hover:text-primary" />
                                                        <span className="group-hover:text-primary">Add Custom Field</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
