"use client"

import React, { useState, useEffect, useRef } from "react"
import {
    Plus, Search, Filter, Smartphone,
    MoreHorizontal, Edit2, Trash2, Eye,
    ArrowUpRight, Package, Smartphone as SmartphoneIcon,
    Tags, Layers, ShieldCheck, Zap, X, Image as ImageIcon,
    ChevronDown, ChevronUp, Save, BarChart3, Shield, Download, Info, Globe, Ruler, Copy, Check
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
const CATEGORIES = ["Smartphones", "Tablets", "Accessories", "Laptops", "Smart Watches", "Headphones", "Foldables", "Gaming", "Refurbished"]
const OS_TYPES = ["iOS", "Android", "HarmonyOS", "Other"]
const DISPLAY_TYPES = ["OLED", "AMOLED", "Super AMOLED", "LTPO OLED", "LCD", "IPS LCD", "IPS", "Liquid Retina"]
const FIELD_TYPES = ["Text", "Number", "Dropdown", "Boolean", "Multi-select"]

function FilterDropdown({ label, options = [], selected, onToggle, icon }: { label: string, options?: string[], selected: string[], onToggle: (val: string) => void, icon?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef} suppressHydrationWarning>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-12 px-4 bg-muted rounded-xl border border-border outline-none flex items-center gap-3 transition-all hover:bg-muted/80",
                    selected.length > 0 && "border-primary/50 bg-primary/5"
                )}
                suppressHydrationWarning
            >
                {icon && <span className="text-muted-foreground opacity-50">{icon}</span>}
                <div className="flex flex-col items-start">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 leading-none">{label}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none mt-1">
                        {selected.length === 0 ? "All" : selected.length === 1 ? selected[0] : `${selected.length} Selected`}
                    </span>
                </div>
                <ChevronDown size={14} className={cn("text-muted-foreground transition-all duration-300", isOpen ? "rotate-180" : "rotate-0")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 z-[100] min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl p-2 flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar"
                        suppressHydrationWarning
                    >
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center opacity-50">
                                No items found
                            </div>
                        )}
                        {options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => onToggle(opt)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    selected.includes(opt) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                )}
                            >
                                <span>{opt}</span>
                                {selected.includes(opt) && <Check size={12} strokeWidth={4} />}
                            </button>
                        ))}
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    options.forEach(opt => {
                                        if (selected.includes(opt)) onToggle(opt)
                                    })
                                }}
                                className="mt-1 border-t border-border pt-1 px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            >
                                Clear All
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>([])
    const [selectedVisibilities, setSelectedVisibilities] = useState<string[]>([])
    const [selectedBadges, setSelectedBadges] = useState<string[]>([])
    const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
    const [activeModalTab, setActiveModalTab] = useState("Overview")
    const [expandedSections, setExpandedSections] = useState<string[]>(["basic", "images"])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false)
    const [newCategoryInput, setNewCategoryInput] = useState("")
    const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false)
    const [newBrandInput, setNewBrandInput] = useState("")

    const dynamicBrands = React.useMemo(() => {
        const brandsFromItems = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))
        return Array.from(new Set([...BRANDS, ...brandsFromItems])).sort()
    }, [products])

    const dynamicCategories = React.useMemo(() => {
        const catsFromItems = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
        return Array.from(new Set([...CATEGORIES, ...catsFromItems])).sort()
    }, [products])
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

    const handleFilterClick = () => {
        toast("Advanced filtering options coming soon.", { icon: "🔍" })
    }

    const initialProductState = {
        brand: "",
        model: "",
        releaseYear: new Date().getFullYear().toString(),
        productColors: [] as { color: string, stock: string, image?: string }[],
        price: "",
        discountPrice: "",
        sku: "",
        category: "Smartphones",
        isHidden: false,
        showDiscountBadge: true,
        isNew: false,
        isFeatured: false,
        stock: "",
        discountPercent: "",
        discountTarget: "both" as "base" | "variants" | "both",
        images: [] as string[],
        quickDescription: "",
        detailedDescription: "",
        customSpecifications: {} as Record<string, { field_name: string, field_type: string, value: any }[]>,
        customSections: [] as { id: string, title: string, icon: string, fields: { field_name: string, field_type: string, value: any }[] }[],
        variants: [] as {
            id: string,
            ram: string,
            storage: string,
            price: string,
            stock: string,
            productColors: { color: string, stock: string, image?: string }[],
            customFields: { key: string, value: string }[]
        }[]
    }

    const [newProduct, setNewProduct] = useState(initialProductState)

    // Safely parse specs — API now returns parsed objects, but defend against
    // cached string data or any edge case where specs is still a raw string.
    const parseSpecs = (raw: any): Record<string, any> => {
        if (!raw) return {}
        if (typeof raw === 'object') return raw
        try { return JSON.parse(raw) } catch { return {} }
    }

    const handleOpenAddModal = () => {
        setEditingProduct(null)
        setNewProduct(initialProductState)
        setIsAddModalOpen(true)
    }

    const handleOpenEditModal = (product: any) => {
        setEditingProduct(product)
        const s = parseSpecs(product.specs)

        // Map legacy colors if productColors doesn't exist in specs
        const mappedColors = s.productColors || [
            { color: product.color || s.identity?.color || "", stock: String(product.stock || "0") }
        ].filter(c => c.color)

        setNewProduct({
            brand: product.brand || "",
            model: (product.name || "").replace(product.brand || "", "").trim(),
            releaseYear: s.identity?.releaseYear || "",
            productColors: mappedColors,
            stock: String(product.stock || ""),
            price: (product.price != null && product.price !== 0) ? String(product.price) : "",
            discountPrice: s.identity?.discountPrice || "",
            sku: s.identity?.sku || "",
            isHidden: s.identity?.isHidden || false,
            showDiscountBadge: s.identity?.showDiscountBadge !== false,
            isNew: product.isNew ?? false,
            isFeatured: product.isFeatured ?? false,
            category: product.category || "Smartphones",
            images: s.gallery || (product.image ? [product.image] : []),
            quickDescription: s.content?.quick || product.description || "",
            detailedDescription: s.content?.detailed || "",
            discountPercent: product.discount ? String(product.discount) : "",
            discountTarget: s.identity?.discountTarget || "both",
            customSpecifications: s.customSpecifications || {},
            customSections: s.customSections || [],
            variants: product.variants?.map((v: any) => ({
                id: v.id,
                ram: v.ram || "",
                storage: v.storage || "",
                price: v.price ? String(v.price) : "",
                stock: v.stock !== undefined ? String(v.stock) : "",
                productColors: Array.isArray(v.productColors) ? v.productColors : [],
                customFields: Array.isArray(v.customFields) ? v.customFields : []
            })) || []
        })
        setIsAddModalOpen(true)
    }

    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        if (isRefreshing) return
        setIsLoading(true)
        setIsRefreshing(true)
        try {
            const res = await fetch("/api/products?all=true")
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
        if (!files || files.length === 0 || isUploading) return

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

            setNewProduct(prev => ({ ...prev, images: [...prev.images, ...data.urls] as any }))

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
        if (!newProduct.brand || !newProduct.model) return toast.error("Brand and Model are required")

        setIsSaving(true)
        const saveToast = toast.loading(editingProduct ? "Updating product..." : "Saving product...")
        try {
            // Determine Stock Strategy
            const hasColors = newProduct.productColors.length > 0
            const hasVariants = newProduct.variants.length > 0

            let totalStock = 0

            if (!hasColors && !hasVariants) {
                // Mode A: Base Stock only
                totalStock = parseInt(newProduct.stock) || 0
            } else if (!hasColors && hasVariants) {
                // Mode B: Variants Only (sum of variant stocks)
                totalStock = newProduct.variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)
            } else if (hasColors && !hasVariants) {
                // Mode C: Colors Only (sum of color stocks)
                totalStock = newProduct.productColors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0)
            } else {
                // Mode D: Both (sum of color stocks as the master limit)
                totalStock = newProduct.productColors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0)

                // Validate Matrix allocations
                for (const color of newProduct.productColors) {
                    const colorLimit = parseInt(color.stock) || 0
                    const allocatedToVariants = newProduct.variants.reduce((sum, v) => {
                        const variantColor = v.productColors.find(vc => vc.color === color.color)
                        return sum + (parseInt(variantColor?.stock || "0") || 0)
                    }, 0)

                    if (allocatedToVariants > colorLimit) {
                        setIsSaving(false)
                        toast.error(`Stock mismatch: ${color.color} variants (${allocatedToVariants}) exceed color limit (${colorLimit})`)
                        toast.dismiss(saveToast)
                        return
                    }
                }
            }


            const sanitizedImages = newProduct.images
                .map(url => String(url || "").trim())
                .filter(url => url.length > 0 && url !== "null" && url !== "undefined")

            const payload = {
                name: `${newProduct.brand} ${newProduct.model}`.trim(),
                description: newProduct.detailedDescription || newProduct.quickDescription,
                quickDescription: newProduct.quickDescription,
                detailedDescription: newProduct.detailedDescription,
                brand: newProduct.brand,
                category: newProduct.category,
                price: parseFloat(newProduct.price) || 0,
                stock: totalStock,
                image: sanitizedImages[0] || "/images/placeholder.png",
                images: sanitizedImages,
                isNew: newProduct.isNew,
                isFeatured: newProduct.isFeatured,
                isSale: !!newProduct.discountPrice || !!newProduct.discountPercent,
                discount: newProduct.discountPercent ? parseInt(newProduct.discountPercent) : (newProduct.discountPrice ? Math.floor(((parseFloat(newProduct.price) - parseFloat(newProduct.discountPrice)) / parseFloat(newProduct.price)) * 100) : null),
                discountPercent: newProduct.discountPercent,
                discountPrice: newProduct.discountPrice,
                specs: {
                    identity: {
                        releaseYear: newProduct.releaseYear,
                        sku: newProduct.sku,
                        isHidden: newProduct.isHidden || false,
                        showDiscountBadge: newProduct.showDiscountBadge !== false,
                        discountPrice: newProduct.discountPrice,
                        discountPercent: newProduct.discountPercent,
                        discountTarget: newProduct.discountTarget
                    },
                    content: {
                        quick: newProduct.quickDescription,
                        detailed: newProduct.detailedDescription
                    },
                    productColors: newProduct.productColors,
                    gallery: sanitizedImages,
                    customSpecifications: newProduct.customSpecifications,
                    customSections: newProduct.customSections
                },
                variants: newProduct.variants.map(v => ({
                    id: (v.id && typeof v.id === 'string' && v.id.startsWith('new_')) ? undefined : v.id,
                    ram: v.ram,
                    storage: v.storage,
                    price: v.price ? parseFloat(v.price) : null,
                    stock: parseInt(v.stock) || 0,
                    productColors: v.productColors,
                    customFields: v.customFields
                }))
            }

            const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products"
            const method = editingProduct ? "PATCH" : "POST"

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                const fullError = errData.details ? `${errData.error}: ${errData.details}` : (errData.error || "Failed to save")
                throw new Error(fullError)
            }

            // API returns the updated product with specs already parsed
            const savedProduct = await res.json()

            toast.success(editingProduct ? "Product Updated" : "Product Saved", { id: saveToast })
            setIsAddModalOpen(false)

            // Immediately update local state from API response (no full refetch lag)
            setProducts(prev => {
                if (editingProduct) {
                    return prev.map(p => p.id === savedProduct.id ? savedProduct : p)
                } else {
                    return [savedProduct, ...prev]
                }
            })

            // Background sync to ensure consistency
            fetchProducts()
        } catch (error: any) {
            console.error("Product lifecycle error:", error)
            toast.error(error.message || "Process failed", { id: saveToast })
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

    const filteredProducts = products.filter(p => {
        const safeName = (p.name || "").toLowerCase()
        const safeBrand = (p.brand || "").toLowerCase()
        const safeCategory = (p.category || "").toLowerCase()
        const safeQuery = (searchQuery || "").toLowerCase()

        const matchesSearch = safeName.includes(safeQuery) ||
            safeBrand.includes(safeQuery) ||
            safeCategory.includes(safeQuery)

        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category)

        const matchesStock = selectedStockStatuses.length === 0 || selectedStockStatuses.some(status => {
            if (status === "In Stock") return p.stock > 10
            if (status === "Low Stock") return p.stock > 0 && p.stock <= 10
            if (status === "Out of Stock") return p.stock <= 0
            return false
        })

        const matchesVisibility = selectedVisibilities.length === 0 || selectedVisibilities.some(v => {
            const isHidden = p.specs?.identity?.isHidden
            if (v === "Visible Only") return !isHidden
            if (v === "Hidden Only") return isHidden
            return false
        })

        const matchesBadge = selectedBadges.length === 0 || selectedBadges.some(b => {
            if (b === "New Arrival") return p.isNew
            if (b === "Hot/Featured") return p.isFeatured
            if (b === "On Sale") return p.isSale
            return false
        })

        const discountPrice = p.specs?.identity?.discountPrice || p.discountPrice
        const discountPct = p.discount || p.specs?.identity?.discountPercent
        const hasDiscount = (discountPrice && parseFloat(discountPrice) > 0 && parseFloat(discountPrice) < p.price) || (discountPct && parseInt(discountPct) > 0)
        const matchesDiscount = selectedDiscounts.length === 0 || selectedDiscounts.some(d => {
            if (d === "Has Discount") return hasDiscount
            if (d === "No Discount") return !hasDiscount
            if (d === "10% - 20% Off") return discountPct >= 10 && discountPct <= 20
            if (d === "20% - 40% Off") return discountPct > 20 && discountPct <= 40
            if (d === "40%+ Off") return discountPct > 40
            return false
        })

        return matchesSearch && matchesBrand && matchesCategory && matchesStock && matchesVisibility && matchesBadge && matchesDiscount
    })


    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1 text-center sm:text-left">
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground  uppercase leading-none">Product Inventory</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-80">Manage models, stock, and pricing analytics.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                    <Button
                        onClick={handleOpenAddModal}
                        className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        ADD NEW PRODUCT
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: "TOTAL PRODUCTS",
                        value: products.length,
                        icon: <SmartphoneIcon className="text-slate-900" size={18} />,
                        bg: "bg-slate-100",
                        status: "ACTIVE"
                    },
                    {
                        label: "STOCK VALUE",
                        value: `KSH ${new Intl.NumberFormat('en-KE').format(Math.floor(products.reduce((acc: number, p: any) => {
                            let val = 0;
                            const vars = p.variants || [];
                            const colors = p.specs?.productColors || [];
                            if (vars.length > 0) {
                                val = vars.reduce((vA: number, v: any) => vA + (parseFloat(v.price || p.price) * (parseInt(v.stock) || 0)), 0);
                            } else if (colors.length > 0) {
                                val = colors.reduce((cA: number, c: any) => cA + (parseFloat(p.price) * (parseInt(c.stock) || 0)), 0);
                            } else {
                                val = (parseFloat(p.price) * (parseInt(p.stock) || 0));
                            }
                            return acc + val;
                        }, 0)))}`,
                        icon: <BarChart3 className="text-slate-900" size={18} />,
                        bg: "bg-slate-100",
                        status: "LIVE"
                    },
                    {
                        label: "NEW ARRIVALS",
                        value: products.filter((p: any) => p.isNew).length,
                        icon: <ShieldCheck className="text-slate-900" size={18} />,
                        bg: "bg-slate-100",
                        status: "RECENT"
                    },
                    {
                        label: "STOCK ALERTS",
                        value: products.filter((p: any) => p.stock < 10).length,
                        icon: <Package className="text-slate-900" size={18} />,
                        bg: "bg-slate-100",
                        status: products.filter((p: any) => p.stock < 10).length > 0 ? "CRITICAL" : "NORMAL"
                    },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-[2rem] border-border bg-card p-6 flex flex-col gap-6 group hover:shadow-xl transition-all shadow-sm relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className={cn("p-4 rounded-2xl transition-all shadow-sm", stat.bg)}>
                                {stat.icon}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                stat.status === "CRITICAL" ? "text-destructive" : "text-muted-foreground opacity-40"
                            )}>
                                {stat.status}
                            </span>
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-none mb-3 opacity-60">{stat.label}</span>
                            <span className="text-xl font-black tracking-tighter text-foreground whitespace-nowrap uppercase">{stat.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search products or models..."
                        className="w-full h-12 bg-muted rounded-xl pl-12 pr-4 outline-none border border-transparent focus:border-primary/20 focus:bg-card transition-all text-sm font-medium text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center flex-wrap gap-2 relative z-20">
                    <FilterDropdown
                        label="Brands"
                        options={dynamicBrands}
                        selected={selectedBrands}
                        onToggle={(val) => setSelectedBrands(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])}
                        icon={<Tags size={16} />}
                    />
                    <FilterDropdown
                        label="Categories"
                        options={dynamicCategories}
                        selected={selectedCategories}
                        onToggle={(val) => setSelectedCategories(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])}
                        icon={<Layers size={16} />}
                    />
                    <FilterDropdown
                        label="Stock"
                        options={["In Stock", "Low Stock", "Out of Stock"]}
                        selected={selectedStockStatuses}
                        onToggle={(val) => setSelectedStockStatuses(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])}
                        icon={<Package size={16} />}
                    />
                    <FilterDropdown
                        label="Visibility"
                        options={["Visible Only", "Hidden Only"]}
                        selected={selectedVisibilities}
                        onToggle={(val) => setSelectedVisibilities(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])}
                        icon={<Eye size={16} />}
                    />
                    <FilterDropdown
                        label="Badges"
                        options={["New Arrival", "Hot/Featured", "On Sale"]}
                        selected={selectedBadges}
                        onToggle={(val) => setSelectedBadges(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])}
                        icon={<Zap size={16} />}
                    />
                    <FilterDropdown
                        label="Discount"
                        options={["Has Discount", "No Discount", "10% - 20% Off", "20% - 40% Off", "40%+ Off"]}
                        selected={selectedDiscounts}
                        onToggle={(val) => setSelectedDiscounts(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])}
                        icon={<Tags size={16} />}
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 sm:px-8 py-6 w-24">Image</th>
                                <th className="px-6 sm:px-8 py-6">Product</th>
                                <th className="px-6 sm:px-8 py-6 hidden lg:table-cell">Details</th>
                                <th className="px-6 sm:px-8 py-6">Stock Status</th>
                                <th className="px-6 sm:px-8 py-6 text-right">Actions</th>
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
                                            <Button variant="link" onClick={() => setIsAddModalOpen(true)} className="text-primary font-black  tracking-widest uppercase text-[10px]">Add One Now</Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 sm:px-8 py-5">
                                            <div className="h-16 w-16 bg-muted rounded-xl relative overflow-hidden border border-border">
                                                <Image src={p.image || "/images/product-placeholder.png"} fill alt="P" className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-primary leading-none">{p.brand}</span>
                                                    {p.isNew && <span className="bg-primary text-[8px] text-primary-foreground px-1.5 py-0.5 rounded font-black ">NEW</span>}
                                                </div>
                                                <span className="text-sm font-black text-foreground tracking-tight mt-1">
                                                    {p.name}
                                                    {p.specs?.identity?.isHidden && (
                                                        <span className="ml-2 bg-orange-500/10 text-orange-600 text-[8px] px-1.5 py-0.5 rounded font-black border border-orange-500/20">HIDDEN</span>
                                                    )}
                                                </span>
                                                {(() => {
                                                    const dp = p.specs?.identity?.discountPrice || p.discountPrice
                                                    const dpNum = dp ? parseFloat(dp) : 0
                                                    const pct = p.discount || parseInt(p.specs?.identity?.discountPercent || "0")
                                                    if (dpNum > 0 && dpNum < p.price) {
                                                        return (
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-black text-emerald-600">KSh {new Intl.NumberFormat('en-KE').format(dpNum)}</span>
                                                                <span className="text-[9px] font-bold text-muted-foreground line-through opacity-50">KSh {new Intl.NumberFormat('en-KE').format(p.price)}</span>
                                                                <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded">{Math.round(((p.price - dpNum) / p.price) * 100)}% OFF</span>
                                                            </div>
                                                        )
                                                    } else if (pct > 0) {
                                                        const computed = Math.round(p.price * (1 - pct / 100))
                                                        return (
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-black text-emerald-600">KSh {new Intl.NumberFormat('en-KE').format(computed)}</span>
                                                                <span className="text-[9px] font-bold text-muted-foreground line-through opacity-50">KSh {new Intl.NumberFormat('en-KE').format(p.price)}</span>
                                                                <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded">{pct}% OFF</span>
                                                            </div>
                                                        )
                                                    }
                                                    return <span className="text-[10px] font-bold text-muted-foreground mt-0.5">KSh {new Intl.NumberFormat('en-KE').format(p.price)}</span>
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-5 hidden lg:table-cell">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">{p.category}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 px-2 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black  uppercase text-primary">
                                                        {p.variants?.length || 0} VARIANTS
                                                    </div>
                                                    <div className="flex -space-x-1">
                                                        {p.variants?.slice(0, 3).map((v: any, idx: number) => (
                                                            <div key={v.id || idx} className="w-2.5 h-2.5 rounded-full border border-card shadow-sm" style={{ backgroundColor: v.color?.toLowerCase() || '#ccc' }} title={v.color} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-4">
                                            <div className="flex flex-col gap-1.5 max-w-[120px]">
                                                <div className="flex justify-between items-center text-[10px] font-black  uppercase">
                                                    <span className="text-foreground">{p.stock} Units</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-1000 bg-primary", p.stock < 10 && "opacity-60")}
                                                        style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 group/stock">
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
                    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden">
                        <motion.div
                            initial={{ x: "100%", opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0.5 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="w-full lg:max-w-5xl h-full bg-card border-l border-border shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
                        >
                            <div className="px-4 lg:px-10 py-4 lg:py-8 border-b border-border/30 flex items-center justify-between bg-muted/[0.02]">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg lg:text-2xl font-black  tracking-tighter text-foreground uppercase leading-none">
                                        {editingProduct ? `Edit ${editingProduct.brand}` : "Add New Product"}
                                    </h2>
                                    <span className="text-[8px] lg:text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] leading-none">
                                        {editingProduct ? `Refining ${editingProduct.model}` : "Enter product details"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={handleSaveProduct}
                                        className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black  uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
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
                                <form id="product-form" onSubmit={handleSaveProduct} className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
                                    <div className="flex flex-col gap-6">
                                        <button type="button" onClick={() => toggleSection("basic")} className="flex items-center gap-4 group text-left">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                <Info size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-bold uppercase tracking-tight text-foreground">1. Basic Details</h3>
                                                <span className="text-[10px] font-medium text-muted-foreground opacity-70">General information, brand, and pricing</span>
                                            </div>
                                            <div className="h-px flex-1 bg-border/20 ml-2" />
                                            {expandedSections.includes("basic") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {expandedSections.includes("basic") && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-8 overflow-hidden">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2 ">Brand</label>
                                                        <div className="flex flex-col gap-2">
                                                            <select
                                                                value={isCreatingNewBrand ? "CREATE_NEW" : newProduct.brand}
                                                                onChange={(e) => {
                                                                    if (e.target.value === "CREATE_NEW") {
                                                                        setIsCreatingNewBrand(true)
                                                                        setNewProduct({ ...newProduct, brand: "" })
                                                                    } else {
                                                                        setIsCreatingNewBrand(false)
                                                                        setNewProduct({ ...newProduct, brand: e.target.value })
                                                                    }
                                                                }}
                                                                className="h-10 bg-muted/40 border border-border/30 rounded-xl px-4 text-[10px] font-bold outline-none"
                                                            >
                                                                <option value="">Select Brand</option>
                                                                {dynamicBrands.map(b => <option key={b} value={b}>{b}</option>)}
                                                                <option value="CREATE_NEW" className="text-primary font-bold">+ Add Brand...</option>
                                                            </select>
                                                            {isCreatingNewBrand && (
                                                                <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="relative flex-1">
                                                                        <Input
                                                                            value={newBrandInput}
                                                                            onChange={(e) => {
                                                                                setNewBrandInput(e.target.value)
                                                                                setNewProduct({ ...newProduct, brand: e.target.value })
                                                                            }}
                                                                            placeholder="NEW BRAND..."
                                                                            className="h-10 bg-primary/5 border-primary/20 rounded-xl text-sm font-medium pr-10" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (newBrandInput.trim()) {
                                                                                    setNewProduct({ ...newProduct, brand: newBrandInput.trim() })
                                                                                    setIsCreatingNewBrand(false)
                                                                                    setNewBrandInput("")
                                                                                    toast.success(`Brand "${newBrandInput}" added`, { icon: "🏢" })
                                                                                }
                                                                            }}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"
                                                                        >
                                                                            <Plus size={14} strokeWidth={4} />
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setIsCreatingNewBrand(false)
                                                                            setNewBrandInput("")
                                                                            setNewProduct({ ...newProduct, brand: dynamicBrands[0] || "" })
                                                                        }}
                                                                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 md:col-span-3">
                                                        <label className="text-[10px] font-bold text-muted-foreground ml-2  uppercase">Product Name / Model</label>
                                                        <Input required value={newProduct.model} onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} placeholder="e.g. iPhone 16 Pro Max" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground ml-2  uppercase">Release Year</label>
                                                        <Input type="number" value={newProduct.releaseYear} onChange={(e) => setNewProduct({ ...newProduct, releaseYear: e.target.value })} placeholder="2026" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                    </div>
                                                </div>



                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                                    <div className="flex flex-col gap-2 md:col-span-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2 ">Category</label>
                                                        <div className="flex flex-col gap-2">
                                                            <select
                                                                value={isCreatingNewCategory ? "CREATE_NEW" : newProduct.category}
                                                                onChange={(e) => {
                                                                    if (e.target.value === "CREATE_NEW") {
                                                                        setIsCreatingNewCategory(true)
                                                                        setNewProduct({ ...newProduct, category: "" })
                                                                    } else {
                                                                        setIsCreatingNewCategory(false)
                                                                        setNewProduct({ ...newProduct, category: e.target.value })
                                                                    }
                                                                }}
                                                                className="h-10 bg-muted/40 border border-border/30 rounded-xl px-4 text-[10px] font-bold outline-none"
                                                            >
                                                                {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                                <option value="CREATE_NEW" className="text-primary font-bold">+ Create Category...</option>
                                                            </select>
                                                            {isCreatingNewCategory && (
                                                                <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="relative flex-1">
                                                                        <Input
                                                                            value={newCategoryInput}
                                                                            onChange={(e) => {
                                                                                setNewCategoryInput(e.target.value)
                                                                                setNewProduct({ ...newProduct, category: e.target.value })
                                                                            }}
                                                                            placeholder="NEW CATEGORY..."
                                                                            className="h-10 bg-primary/5 border-primary/20 rounded-xl text-sm font-medium pr-10" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (newCategoryInput.trim()) {
                                                                                    setNewProduct({ ...newProduct, category: newCategoryInput.trim() })
                                                                                    setIsCreatingNewCategory(false)
                                                                                    setNewCategoryInput("")
                                                                                    toast.success(`Category "${newCategoryInput}" created`, { icon: "✅" })
                                                                                }
                                                                            }}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"
                                                                        >
                                                                            <Plus size={14} strokeWidth={4} />
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setIsCreatingNewCategory(false)
                                                                            setNewCategoryInput("")
                                                                            setNewProduct({ ...newProduct, category: dynamicCategories[0] })
                                                                        }}
                                                                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 md:col-span-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground ml-2  uppercase">SKU / Serial</label>
                                                        <Input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="e.g. AP-IP16-256-BK" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                    </div>
                                                    {newProduct.productColors.length === 0 && (
                                                        <div className="flex flex-col gap-2 md:col-span-1">
                                                            <label className="text-[10px] font-bold text-muted-foreground ml-2  uppercase">Total Stock</label>
                                                            <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                        </div>
                                                    )}

                                                </div>


                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground ml-2">Standard Price (KSh)</label>
                                                        <Input required type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="e.g. 150000" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between ml-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground">Sale Pricing (Optional)</label>
                                                            {/* Only show target toggle when variants exist */}
                                                            {newProduct.variants.length > 0 && (
                                                                <div className="flex items-center gap-4 px-3 py-1 bg-muted/40 rounded-lg border border-border/10">
                                                                    {[
                                                                        { id: 'base', label: 'Main' },
                                                                        { id: 'variants', label: 'Vars' },
                                                                        { id: 'both', label: 'Both' }
                                                                    ].map(t => (
                                                                        <button
                                                                            key={t.id}
                                                                            type="button"
                                                                            onClick={() => setNewProduct({ ...newProduct, discountTarget: t.id as any })}
                                                                            className={cn(
                                                                                "text-[8px] font-black uppercase tracking-widest transition-all",
                                                                                newProduct.discountTarget === t.id ? "text-primary scale-110" : "text-muted-foreground opacity-30 hover:opacity-100"
                                                                            )}
                                                                        >
                                                                            {t.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    type="number"
                                                                    value={newProduct.discountPrice}
                                                                    onChange={(e) => {
                                                                        const dp = e.target.value
                                                                        const base = parseFloat(newProduct.price)
                                                                        const sale = parseFloat(dp)
                                                                        const pct = base > 0 && sale > 0 && sale < base
                                                                            ? String(Math.round(((base - sale) / base) * 100))
                                                                            : ""
                                                                        setNewProduct({ ...newProduct, discountPrice: dp, discountPercent: pct })
                                                                    }}
                                                                    placeholder="New Price"
                                                                    className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium pr-10"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-medium opacity-40">KSh</span>
                                                            </div>
                                                            <div className="relative w-24">
                                                                <Input
                                                                    type="number"
                                                                    value={newProduct.discountPercent}
                                                                    onChange={(e) => {
                                                                        const pct = e.target.value
                                                                        const base = parseFloat(newProduct.price)
                                                                        const p = parseFloat(pct)
                                                                        const dp = base > 0 && p > 0 && p < 100
                                                                            ? String(Math.round(base * (1 - p / 100)))
                                                                            : ""
                                                                        setNewProduct({ ...newProduct, discountPercent: pct, discountPrice: dp })
                                                                    }}
                                                                    placeholder="Off %"
                                                                    className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium pr-10"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-medium opacity-40">%</span>
                                                            </div>
                                                        </div>
                                                        {/* Live preview */}
                                                        {newProduct.discountPrice && newProduct.discountPercent && parseFloat(newProduct.price) > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                                    KSh {parseFloat(newProduct.price).toLocaleString()} → KSh {parseFloat(newProduct.discountPrice).toLocaleString()} ({newProduct.discountPercent}% off)
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2 mt-auto">
                                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 h-10">
                                                            <input type="checkbox" checked={newProduct.isHidden} onChange={(e) => setNewProduct({ ...newProduct, isHidden: e.target.checked })} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                                                            <span className="text-[11px] font-black text-orange-600 leading-none uppercase  tracking-widest">Hide Product</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 h-10">
                                                            <input type="checkbox" checked={newProduct.showDiscountBadge} onChange={(e) => setNewProduct({ ...newProduct, showDiscountBadge: e.target.checked })} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                                                            <span className="text-[11px] font-black text-emerald-600 leading-none uppercase  tracking-widest">Show Sale Badge</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 h-10">
                                                            <input type="checkbox" checked={newProduct.isNew} onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })} className="w-4 h-4 accent-primary cursor-pointer" />
                                                            <span className="text-[11px] font-black text-primary leading-none uppercase  tracking-widest">Mark as New Arrival</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 h-10">
                                                            <input type="checkbox" checked={newProduct.isFeatured} onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })} className="w-4 h-4 accent-amber-500 cursor-pointer" />
                                                            <span className="text-[11px] font-black text-amber-600 leading-none uppercase  tracking-widest">Mark as Hot / Best Seller</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* MULTI-COLOR MANAGEMENT */}
                                                <div className="flex flex-col gap-4 p-6 bg-muted/5 border border-border/10 rounded-[2rem] mt-2 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-sm font-bold text-primary">Color Options</label>
                                                            <span className="text-[10px] font-medium text-muted-foreground opacity-60">Manage available colors and their stock levels</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct({ ...newProduct, productColors: [...newProduct.productColors, { color: "", stock: "0" }] })}
                                                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-all border border-primary/10"
                                                        >
                                                            <Plus size={14} /> Add Color
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {newProduct.productColors.map((cp, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 p-3 bg-muted/20 border border-border/20 rounded-2xl group/color">
                                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <label className="text-[10px] font-bold text-muted-foreground/80 ml-2">Color Name</label>
                                                                        <Input
                                                                            value={cp.color}
                                                                            onChange={(e) => {
                                                                                const ncc = [...newProduct.productColors];
                                                                                ncc[idx].color = e.target.value;
                                                                                setNewProduct({ ...newProduct, productColors: ncc });
                                                                            }}
                                                                            placeholder="e.g. Silver"
                                                                            className="h-8 bg-background border-border/10 rounded-lg text-sm font-medium"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <label className="text-[10px] font-bold text-muted-foreground/80 ml-2">
                                                                            {newProduct.variants.length > 0 ? "Total Limit" : "Stock"}
                                                                        </label>
                                                                        <Input
                                                                            type="number"
                                                                            value={cp.stock}
                                                                            onChange={(e) => {
                                                                                const ncc = [...newProduct.productColors];
                                                                                ncc[idx].stock = e.target.value;
                                                                                setNewProduct({ ...newProduct, productColors: ncc });
                                                                            }}
                                                                            placeholder="0"
                                                                            className={cn(
                                                                                "h-8 bg-background border-border/10 rounded-lg text-sm font-medium",
                                                                                newProduct.variants.length > 0 && "border-primary/20 bg-primary/[0.02]"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1.5 overflow-hidden">
                                                                        <label className="text-[10px] font-bold text-muted-foreground/80 ml-2">Link Image</label>
                                                                        <div className="flex gap-1.5 p-1 bg-background border border-border/10 rounded-lg overflow-x-auto no-scrollbar min-h-8 items-center">
                                                                            {newProduct.images.length > 0 ? (
                                                                                newProduct.images.map((img: string, i: number) => (
                                                                                    <button
                                                                                        key={i}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const ncc = [...newProduct.productColors];
                                                                                            ncc[idx].image = img;
                                                                                            setNewProduct({ ...newProduct, productColors: ncc });
                                                                                        }}
                                                                                        className={cn(
                                                                                            "w-6 h-6 rounded shrink-0 transition-all relative group/thumb overflow-hidden border-2",
                                                                                            cp.image === img ? "border-primary scale-105" : "border-transparent opacity-40 hover:opacity-100"
                                                                                        )}
                                                                                    >
                                                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                                                    </button>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-[7px] font-bold text-muted-foreground/30  ml-2">Upload Photos First</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const ncc = newProduct.productColors.filter((_, i) => i !== idx);
                                                                        setNewProduct({ ...newProduct, productColors: ncc });
                                                                    }}
                                                                    className="p-2 text-destructive/40 hover:text-destructive opacity-0 group-hover/color:opacity-100 transition-all"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {newProduct.productColors.length === 0 && (
                                                            <div className="col-span-full py-8 text-center border-2 border-dashed border-border/10 rounded-2xl">
                                                                <span className="text-[9px] font-black uppercase text-muted-foreground opacity-30 ">No color inventory added. Use the button above to start.</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-between ml-2">
                                                            <label className="text-xs font-bold text-primary">Short Intro</label>
                                                            <span className="text-[10px] font-medium text-muted-foreground opacity-60">Highlight points</span>
                                                        </div>
                                                        <textarea
                                                            value={newProduct.quickDescription}
                                                            onChange={(e) => setNewProduct({ ...newProduct, quickDescription: e.target.value })}
                                                            placeholder="e.g. 50MP Camera, 5000mAh Battery..."
                                                            className="min-h-[140px] bg-muted/20 border border-border/20 rounded-[2rem] p-6 text-sm font-medium focus:border-primary/40 outline-none resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-between ml-2">
                                                            <label className="text-xs font-bold text-primary">Full Description</label>
                                                            <span className="text-[10px] font-medium text-muted-foreground opacity-60">Technical details</span>
                                                        </div>
                                                        <textarea
                                                            value={newProduct.detailedDescription}
                                                            onChange={(e) => setNewProduct({ ...newProduct, detailedDescription: e.target.value })}
                                                            placeholder="Enter full technical specs and features..."
                                                            className="min-h-[140px] bg-muted/20 border border-border/20 rounded-[2rem] p-6 text-sm font-medium focus:border-primary/40 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>

                                                {(newProduct.customSpecifications['basic'] || []).map((cf, idx) => (
                                                    <div key={idx} className="flex flex-col gap-2 relative group/field">
                                                        <div className="flex items-center justify-between ml-2">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input
                                                                    className="text-[9px] font-black uppercase tracking-[0.1em] text-primary bg-transparent outline-none w-full placeholder:text-primary/20 "
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
                                                <h3 className="text-sm font-bold uppercase tracking-tight text-foreground">2. Options & Sizes</h3>
                                                <span className="text-[10px] font-medium text-muted-foreground opacity-70">Manage storage, RAM, and version-specific details</span>
                                            </div>
                                            <div className="h-px flex-1 bg-border/20 ml-2" />
                                            {expandedSections.includes("variants") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {expandedSections.includes("variants") && (
                                            <motion.div initial={{ opacity: 0, height: "auto" }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-6">
                                                {/* INVENTORY CONTROL HUB - INTEGRATED MATRIX */}
                                                {newProduct.productColors.length > 0 && newProduct.variants.length > 0 && (
                                                    <div className="p-8 bg-primary/[0.02] border-2 border-primary/10 rounded-[3rem] my-4 flex flex-col gap-8 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                                    <BarChart3 size={16} />
                                                                </div>
                                                                <h3 className="text-sm font-bold uppercase text-primary">Stock Distribution</h3>
                                                            </div>
                                                            <p className="text-[10px] font-medium text-muted-foreground opacity-60 ml-11">Distribute available stock across colors and sizes.</p>
                                                        </div>

                                                        <div className="overflow-x-auto rounded-3xl border border-border/30 bg-card/80 backdrop-blur-sm">
                                                            <table className="w-full text-left border-collapse min-w-[700px]">
                                                                <thead>
                                                                    <tr className="bg-muted/40 border-b border-border/30">
                                                                        <th className="p-5 text-[10px] font-bold uppercase text-muted-foreground w-40">Color</th>
                                                                        <th className="p-5 text-[10px] font-bold uppercase text-primary w-32 border-x border-border/10">Capacity</th>
                                                                        {newProduct.variants.map((v, idx) => (
                                                                            <th key={v.id || idx} className="p-5 text-[10px] font-bold uppercase text-muted-foreground text-center">
                                                                                <div className="flex flex-col gap-0.5">
                                                                                    <span className="text-primary">{v.ram}/{v.storage}</span>
                                                                                </div>
                                                                            </th>
                                                                        ))}
                                                                        <th className="p-5 text-[10px] font-bold uppercase text-muted-foreground text-right">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-border/10">
                                                                    {newProduct.productColors.map((cp, cIdx) => {
                                                                        const colorLimit = parseInt(cp.stock) || 0
                                                                        const allocated = newProduct.variants.reduce((sum, v) => {
                                                                            const vc = v.productColors.find(x => x.color === cp.color)
                                                                            return sum + (parseInt(vc?.stock || "0") || 0)
                                                                        }, 0)
                                                                        const isOverBy = allocated - colorLimit

                                                                        return (
                                                                            <tr key={cIdx} className="hover:bg-muted/10 transition-colors">
                                                                                <td className="p-5">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-3 h-3 rounded-full border border-border/20 shadow-sm" style={{ backgroundColor: cp.color?.toLowerCase() || '#ccc' }} />
                                                                                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{cp.color}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-5 border-x border-border/10 bg-primary/[0.01]">
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={cp.stock}
                                                                                        onChange={(e) => {
                                                                                            const ncc = [...newProduct.productColors];
                                                                                            ncc[cIdx].stock = e.target.value;
                                                                                            setNewProduct({ ...newProduct, productColors: ncc });
                                                                                        }}
                                                                                        className="h-8 bg-transparent border-0 text-[10px] font-black text-primary text-center focus-visible:ring-0"
                                                                                    />
                                                                                </td>
                                                                                {newProduct.variants.map((v, vIdx) => {
                                                                                    const vc = v.productColors.find(x => x.color === cp.color)
                                                                                    return (
                                                                                        <td key={v.id || vIdx} className="p-5">
                                                                                            <Input
                                                                                                type="number"
                                                                                                value={vc?.stock || "0"}
                                                                                                onChange={(e) => {
                                                                                                    const nv = [...newProduct.variants]
                                                                                                    const currentV = { ...nv[vIdx] }
                                                                                                    const nvc = [...(currentV.productColors || [])]
                                                                                                    const ci = nvc.findIndex(x => x.color === cp.color)
                                                                                                    if (ci >= 0) {
                                                                                                        nvc[ci] = { ...nvc[ci], stock: e.target.value }
                                                                                                    } else {
                                                                                                        nvc.push({ color: cp.color, stock: e.target.value })
                                                                                                    }
                                                                                                    currentV.productColors = nvc
                                                                                                    nv[vIdx] = currentV
                                                                                                    setNewProduct({ ...newProduct, variants: nv })
                                                                                                }}
                                                                                                className={cn(
                                                                                                    "h-8 bg-muted/20 border-border/5 rounded-lg text-[10px] font-black text-center mx-auto w-16",
                                                                                                    isOverBy > 0 && "border-rose-500/30 text-rose-500 bg-rose-500/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                                                                                                )}
                                                                                                placeholder="0"
                                                                                            />
                                                                                        </td>
                                                                                    )
                                                                                })}
                                                                                <td className="p-5 text-right">
                                                                                    <div className="flex flex-col items-end gap-1">
                                                                                        <span className={cn(
                                                                                            "text-[9px] font-black uppercase  tracking-tighter leading-none",
                                                                                            isOverBy > 0 ? "text-rose-500" : "text-emerald-500"
                                                                                        )}>
                                                                                            {allocated} / {colorLimit}
                                                                                        </span>
                                                                                        <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                                                                                            <div
                                                                                                className={cn("h-full transition-all duration-500", isOverBy > 0 ? "bg-rose-500" : "bg-emerald-500")}
                                                                                                style={{ width: `${Math.min(100, (allocated / (colorLimit || 1)) * 100)}%` }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                                <tfoot className="bg-muted/10 border-t border-border/30">
                                                                    <tr>
                                                                        <td className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground  opacity-60">Total Distribution</td>
                                                                        <td className="p-5 border-x border-border/10 text-center font-black text-[11px]  text-primary">
                                                                            {newProduct.productColors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0)}
                                                                        </td>
                                                                        {newProduct.variants.map((v, idx) => (
                                                                            <td key={idx} className="p-5 text-center font-black text-[10px] text-muted-foreground ">
                                                                                {v.productColors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0)}
                                                                            </td>
                                                                        ))}
                                                                        <td></td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                        {newProduct.productColors.some(c => (newProduct.variants.reduce((sum, v) => sum + (parseInt(v.productColors.find(vc => vc.color === c.color)?.stock || "0") || 0), 0)) > (parseInt(c.stock) || 0)) && (
                                                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-4 text-rose-500 animate-pulse">
                                                                <X size={16} />
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] ">Alert: One or more colors have overallocated variant stock. Please correct to save.</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {newProduct.variants.map((variant, vIdx) => (
                                                    <div key={variant.id} className="p-6 border border-border/30 rounded-2xl bg-muted/10 relative group shadow-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct({ ...newProduct, variants: newProduct.variants.filter(v => v.id !== variant.id) })}
                                                            className="absolute top-4 right-4 text-destructive opacity-30 hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-bold text-muted-foreground ml-2">RAM</label>
                                                                <Input value={variant.ram || ""} onChange={(e) => {
                                                                    const nv = [...newProduct.variants];
                                                                    nv[vIdx] = { ...nv[vIdx], ram: e.target.value };
                                                                    setNewProduct({ ...newProduct, variants: nv });
                                                                }} placeholder="e.g. 8GB" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-bold text-muted-foreground ml-2">Storage</label>
                                                                <Input value={variant.storage || ""} onChange={(e) => {
                                                                    const nv = [...newProduct.variants];
                                                                    nv[vIdx] = { ...nv[vIdx], storage: e.target.value };
                                                                    setNewProduct({ ...newProduct, variants: nv });
                                                                }} placeholder="e.g. 256GB" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-bold text-muted-foreground ml-2">Variant Price (KSh)</label>
                                                                <Input type="number" value={variant.price || ''} onChange={(e) => {
                                                                    const nv = [...newProduct.variants];
                                                                    nv[vIdx] = { ...nv[vIdx], price: e.target.value };
                                                                    setNewProduct({ ...newProduct, variants: nv });
                                                                }} placeholder="Optional override" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                            </div>
                                                            {newProduct.productColors.length === 0 && (
                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-[10px] font-bold text-muted-foreground ml-2">Stock</label>
                                                                    <Input type="number" value={variant.stock || ''} onChange={(e) => {
                                                                        const nv = [...newProduct.variants];
                                                                        nv[vIdx] = { ...nv[vIdx], stock: e.target.value };
                                                                        setNewProduct({ ...newProduct, variants: nv });
                                                                    }} placeholder="Variant stock" className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium" />
                                                                </div>
                                                            )}
                                                            {variant.customFields?.map((f, fIdx) => (
                                                                <div key={fIdx} className="flex flex-col gap-2 group/fld relative">
                                                                    <div className="flex items-center justify-between ml-1 leading-none h-3">
                                                                        <input
                                                                            value={f.key}
                                                                            onChange={(e) => {
                                                                                const nv = [...newProduct.variants];
                                                                                const currentVariant = { ...nv[vIdx] };
                                                                                const ncf = [...(currentVariant.customFields || [])];
                                                                                ncf[fIdx] = { ...ncf[fIdx], key: e.target.value };
                                                                                currentVariant.customFields = ncf;
                                                                                nv[vIdx] = currentVariant;
                                                                                setNewProduct({ ...newProduct, variants: nv });
                                                                            }}
                                                                            placeholder="Detail Name"
                                                                            className="text-[10px] font-bold text-primary bg-transparent outline-none w-full placeholder:text-primary/20"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const nv = [...newProduct.variants];
                                                                                nv[vIdx].customFields = nv[vIdx].customFields.filter((_, i) => i !== fIdx);
                                                                                setNewProduct({ ...newProduct, variants: nv });
                                                                            }}
                                                                            className="text-destructive/40 hover:text-destructive opacity-0 group-hover/fld:opacity-100 transition-all"
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    </div>
                                                                    <Input
                                                                        value={f.value}
                                                                        onChange={(e) => {
                                                                            const nv = [...newProduct.variants];
                                                                            const currentVariant = { ...nv[vIdx] };
                                                                            const ncf = [...(currentVariant.customFields || [])];
                                                                            ncf[fIdx] = { ...ncf[fIdx], value: e.target.value };
                                                                            currentVariant.customFields = ncf;
                                                                            nv[vIdx] = currentVariant;
                                                                            setNewProduct({ ...newProduct, variants: nv });
                                                                        }}
                                                                        placeholder="Value..."
                                                                        className="h-10 bg-muted/30 border-border/20 rounded-xl text-sm font-medium"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* COLOR SELECTOR & STOCK FOR THIS SPEC VARIANT */}
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex items-center justify-between px-2">
                                                                <label className="text-xs font-bold text-muted-foreground">Stock per Color</label>
                                                                <span className="text-[10px] font-medium text-muted-foreground/40 ">Allocated: {variant.productColors.reduce((sum, c) => sum + (parseInt(c.stock) || 0), 0)} Units</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {newProduct.productColors.filter(c => c.color).map((cp) => {
                                                                    const pc = variant.productColors.find(x => x.color === cp.color);
                                                                    return (
                                                                        <div key={cp.color} className="flex items-center gap-2 p-3 bg-background border border-border/10 rounded-xl shadow-sm">
                                                                            <span className="text-[11px] font-bold opacity-70 w-24 truncate">{cp.color}</span>
                                                                            <Input
                                                                                type="number"
                                                                                value={pc?.stock || "0"}
                                                                                onChange={(e) => {
                                                                                    const nv = [...newProduct.variants];
                                                                                    const currentVariant = { ...nv[vIdx] }; const nvc = [...(currentVariant.productColors || [])];
                                                                                    const ci = nvc.findIndex(x => x.color === cp.color);
                                                                                    if (ci >= 0) {
                                                                                        nvc[ci] = { ...nvc[ci], stock: e.target.value };
                                                                                    } else {
                                                                                        nvc.push({ color: cp.color, stock: e.target.value });
                                                                                    }
                                                                                    currentVariant.productColors = nvc; nv[vIdx] = currentVariant;
                                                                                    setNewProduct({ ...newProduct, variants: nv });
                                                                                }}
                                                                                className="h-8 bg-muted/20 border-border/5 rounded-lg text-sm font-medium w-24 ml-auto"
                                                                                placeholder="Stock"
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                                {newProduct.productColors.filter(c => c.color).length === 0 && (
                                                                    <div className="col-span-full py-4 text-center border-2 border-dashed border-border/10 rounded-2xl opacity-30  text-[10px] font-medium">
                                                                        No inventory colors available. Add them in basic info first.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* VARIANT CUSTOM FIELDS TRIGGER */}
                                                        <div className="flex flex-col gap-4 mt-2">
                                                            <div className="flex items-center justify-end px-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const nv = [...newProduct.variants];
                                                                        nv[vIdx].customFields = [...(nv[vIdx].customFields || []), { key: "", value: "" }];
                                                                        setNewProduct({ ...newProduct, variants: nv });
                                                                    }}
                                                                    className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1.5"
                                                                >
                                                                    <Plus size={12} /> Add Custom Detail
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => setNewProduct({
                                                        ...newProduct,
                                                        variants: [...newProduct.variants, {
                                                            id: `new_${Math.random().toString(36).substr(2, 9)}`,
                                                            ram: "",
                                                            storage: "",
                                                            price: "",
                                                            stock: "",
                                                            productColors: [] as { color: string, stock: string }[],
                                                            customFields: [] as { key: string, value: string }[]
                                                        }]
                                                    })}
                                                    className="h-12 border-2 border-dashed border-border/20 rounded-xl flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold uppercase text-muted-foreground"
                                                >
                                                    <Plus size={16} /> Add New Variant (Size/RAM)
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
                                                <h3 className="text-sm font-bold uppercase tracking-tight text-foreground">3. Photos</h3>
                                                <span className="text-[10px] font-medium text-muted-foreground opacity-70">Upload high-quality product images</span>
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
                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                                                                {i > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const imgs = [...newProduct.images];
                                                                            [imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]];
                                                                            setNewProduct({ ...newProduct, images: imgs });
                                                                        }}
                                                                        className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                                    >
                                                                        <ChevronDown className="rotate-90" size={14} />
                                                                    </button>
                                                                )}
                                                                {i < newProduct.images.length - 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const imgs = [...newProduct.images];
                                                                            [imgs[i + 1], imgs[i]] = [imgs[i], imgs[i + 1]];
                                                                            setNewProduct({ ...newProduct, images: imgs });
                                                                        }}
                                                                        className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                                    >
                                                                        <ChevronDown className="-rotate-90" size={14} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const imgs = [...newProduct.images];
                                                                        imgs.splice(i, 1);
                                                                        setNewProduct({ ...newProduct, images: imgs });
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div
                                                        className="md:col-span-full relative"
                                                    >
                                                        <div className="relative group/uploader overflow-hidden rounded-[2.5rem] bg-slate-900/[0.02] border-2 border-dashed border-slate-900/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-500 p-8 flex flex-col items-center justify-center text-center gap-4">
                                                            <div className="w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-900/5 flex items-center justify-center text-primary group-hover/uploader:scale-110 group-hover/uploader:rotate-12 transition-all duration-500">
                                                                <ImageIcon size={28} strokeWidth={1.5} />
                                                            </div>
                                                            <div className="flex flex-col gap-1 max-w-[280px]">
                                                                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Universal Asset Portal</h4>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 leading-relaxed">
                                                                    Drop your masters here. <br />
                                                                    <span className="text-primary opacity-60">Paste from clipboard</span> or browse locally.
                                                                </p>
                                                            </div>
                                                            <div className="h-px w-24 bg-slate-900/5 my-2" />
                                                            <label
                                                                htmlFor="product-image-upload"
                                                                className="relative h-12 px-10 rounded-full bg-slate-900 text-white flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20"
                                                            >
                                                                <Plus size={16} strokeWidth={3} />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select Assets</span>
                                                                <input
                                                                    id="product-image-upload"
                                                                    type="file"
                                                                    multiple
                                                                    onChange={handleImageUpload}
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                />
                                                            </label>

                                                            {/* Subtle corner accents */}
                                                            <div className="absolute top-6 left-6 w-3 h-3 border-t-2 border-l-2 border-slate-900/10 rounded-tl-sm" />
                                                            <div className="absolute top-6 right-6 w-3 h-3 border-t-2 border-r-2 border-slate-900/10 rounded-tr-sm" />
                                                            <div className="absolute bottom-6 left-6 w-3 h-3 border-b-2 border-l-2 border-slate-900/10 rounded-bl-sm" />
                                                            <div className="absolute bottom-6 right-6 w-3 h-3 border-b-2 border-r-2 border-slate-900/10 rounded-br-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* All legacy spec sections removed - favoring simplified Quick/Detailed description architecture */}
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
