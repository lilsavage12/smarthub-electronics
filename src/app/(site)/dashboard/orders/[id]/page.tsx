"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
    ArrowLeft, Package, MapPin, CreditCard, Loader2, 
    CheckCircle2, Clock, Truck, ShieldCheck, Phone, Mail,
    Download, HelpCircle, ChevronRight, FileText, Eye, X
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

interface OrderItem {
    id: string
    productId: string
    name: string
    quantity: number
    price: number
    image: string
}

interface Order {
    id: string
    orderNumber: string
    customerName: string
    customerEmail: string
    customerPhone: string
    address: string
    city: string
    totalAmount: number
    status: string
    paymentMethod: string
    paymentStatus: string
    createdAt: string
    items: OrderItem[]
}

export default function OrderDetails() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const orderId = params?.id as string
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewType, setPreviewType] = useState<'invoice' | 'receipt' | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const downloadDocument = async (type: 'invoice' | 'receipt') => {
        const toastId = toast.loading(`Generating electronic ${type} protocol...`)
        try {
            const res = await fetch(`/api/orders/${orderId}/${type}`)
            if (!res.ok) throw new Error(`Failed to generate ${type}`)

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${type.charAt(0).toUpperCase() + type.slice(1)}-${order?.orderNumber || orderId}.pdf`
            a.click()
            // Clean up the URL after a short delay
            setTimeout(() => window.URL.revokeObjectURL(url), 1000)
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded successfully`, { id: toastId })
        } catch (error: any) {
            console.error("Download failure:", error)
            toast.error(`Download failed: ${error.message || 'Transmission error'}`, { id: toastId })
        }
    }

    const previewDocument = async (type: 'invoice' | 'receipt') => {
        setIsGenerating(true)
        setPreviewType(type)
        const toastId = toast.loading(`Preparing ${type} preview...`)
        try {
            const res = await fetch(`/api/orders/${orderId}/${type}`)
            if (!res.ok) throw new Error(`Failed to generate ${type}`)

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            setPreviewUrl(url)
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} preview ready`, { id: toastId })
        } catch (error: any) {
            console.error("Preview failure:", error)
            toast.error(`Preview failed: ${error.message || 'System error'}`, { id: toastId })
            setPreviewType(null)
        } finally {
            setIsGenerating(false)
        }
    }

    const closePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(null)
        setPreviewType(null)
    }

    const fetchOrder = async () => {
        if (!user || !orderId) return
        try {
            const queryParams = `userId=${user.id}`
            const res = await fetch(`/api/orders?${queryParams}`)
            if (res.ok) {
                const orders = await res.json()
                const foundOrder = orders.find((o: Order) => o.id === orderId)
                if (foundOrder) {
                    setOrder(foundOrder)
                } else {
                    router.push("/dashboard/orders")
                }
            }
        } catch (error) {
            console.error("Failed to fetch order:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }

        if (!orderId) return

        fetchOrder()

        // Real-time updates for THIS specific order
        const channel = supabase
            .channel(`order-details-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Order',
                    filter: `id=eq.${orderId}`
                },
                () => {
                    console.log('Order update detected on detail page, refreshing...')
                    fetchOrder()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, router, orderId])

    if (!user) return null

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "PENDING":
                return { label: "Payment Pending", icon: <Clock className="w-4 h-4" />, styles: "bg-yellow-50 text-yellow-600 border-yellow-100" }
            case "PROCESSING":
                return { label: "Processing", icon: <Package className="w-4 h-4" />, styles: "bg-blue-50 text-blue-600 border-blue-100" }
            case "SHIPPED":
                return { label: "In Transit", icon: <Truck className="w-4 h-4" />, styles: "bg-purple-50 text-purple-600 border-purple-100" }
            case "DELIVERED":
                return { label: "Delivered", icon: <CheckCircle2 className="w-4 h-4" />, styles: "bg-emerald-50 text-emerald-600 border-emerald-100" }
            case "CANCELLED":
                return { label: "Cancelled", icon: <Package className="w-4 h-4" />, styles: "bg-rose-50 text-rose-600 border-rose-100" }
            default:
                return { label: status, icon: <Clock className="w-4 h-4" />, styles: "bg-gray-50 text-gray-600 border-gray-100" }
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Initializing Order Details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!order) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <p className="text-xl font-bold uppercase italic tracking-tighter">Order intelligence not found</p>
                    <Link href="/dashboard/orders">
                        <Button variant="link" className="mt-4 font-black uppercase tracking-widest text-[10px]">Return to History</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const currentStatus = getStatusInfo(order.status)

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link
                            href="/dashboard/orders"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
                        >
                            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                            Return to Orders
                        </Link>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Order <span className="text-primary italic">#{order.orderNumber}</span></h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-background">{currentStatus.icon} {currentStatus.label}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest pl-1">Official Invoice</span>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => previewDocument('invoice')}
                                    className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[9px] border-border hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-2" />
                                    Preview
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => downloadDocument('invoice')}
                                    className="rounded-xl h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border-l border-border pl-4">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest pl-1">Quick Receipt</span>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => previewDocument('receipt')}
                                    className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[9px] border-border hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-2" />
                                    Preview
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => downloadDocument('receipt')}
                                    className="rounded-xl h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    <FileText className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border-l border-border pl-4">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest pl-1">Delivery Status</span>
                            <Link href="/track-order">
                                <Button className="rounded-xl h-10 px-6 font-black uppercase italic tracking-widest text-[9px] shadow-lg shadow-primary/10">
                                    <Truck className="w-3.5 h-3.5 mr-2" />
                                    Track Asset
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Items & Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Items */}
                        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-border bg-accent/20 flex items-center justify-between">
                                <h2 className="text-sm font-black uppercase tracking-widest">Dispatch Contents ({order.items.length})</h2>
                                <Package className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                            <div className="p-4 sm:p-8 space-y-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-accent/30 rounded-3xl border border-transparent hover:border-primary/20 transition-all group"
                                    >
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-background rounded-2xl overflow-hidden border border-border/50 shadow-inner group-hover:scale-105 transition-transform">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-bold text-base sm:text-lg mb-1 truncate uppercase italic tracking-tight">{item.name}</h3>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                <span>Qty: {item.quantity}</span>
                                                <span>•</span>
                                                <span className="text-primary font-black">${item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xl font-black font-outfit italic tracking-tighter">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Support Quick Access */}
                        <div className="p-8 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 rounded-[2rem] flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase italic text-sm">Need assistance with this order?</h4>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Our support agents are available 24/7.</p>
                                </div>
                            </div>
                            <Link href="/contact">
                                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all p-0 h-auto">
                                    Contact Support <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Order Intelligence */}
                    <div className="space-y-8">
                        {/* Status Summary */}
                        <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm overflow-hidden relative">
                             {/* Small decorative background text */}
                            <div className="absolute -bottom-4 -right-2 text-[60px] font-black text-muted-foreground/5 italic leading-none pointer-events-none uppercase tracking-tighter select-none">DATA</div>
                            
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-border pb-4">Logistics Stats</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1.5">Destination</p>
                                        <p className="text-sm font-bold uppercase leading-tight">{order.customerName}</p>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{order.address}, {order.city}</p>
                                        <div className="flex flex-col gap-1 pt-2">
                                            <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><Phone className="w-3 h-3" /> {order.customerPhone}</span>
                                            <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><Mail className="w-3 h-3" /> {order.customerEmail}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1.5">Payment Intel</p>
                                        <p className="text-sm font-bold uppercase">{order.paymentMethod}</p>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border mt-2",
                                            order.paymentStatus === "PAID"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                : "bg-yellow-50 text-yellow-600 border-yellow-200"
                                        )}>
                                            <ShieldCheck className="w-3 h-3" /> {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-border space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                    <span>Base Value</span>
                                    <span className="text-foreground">${order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 italic">Complementary</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-dashed border-border">
                                    <span className="text-sm font-black uppercase tracking-widest italic">Total Order</span>
                                    <span className="text-2xl font-black font-outfit italic tracking-tighter text-primary">${order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Document Preview Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-5xl h-full bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-black uppercase italic tracking-tighter">
                                            {previewType === 'invoice' ? 'Electronic Invoice' : 'Transaction Receipt'}
                                        </h3>
                                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Previewing Document Manifest
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button 
                                        variant="outline" 
                                        className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
                                        onClick={() => downloadDocument(previewType!)}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Save File
                                    </Button>
                                    <button 
                                        onClick={closePreview}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-muted/10 relative">
                                <iframe 
                                    src={previewUrl} 
                                    className="w-full h-full border-none"
                                    title="Document Preview"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
