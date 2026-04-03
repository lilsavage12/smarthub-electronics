"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
    ArrowLeft, Package, MapPin, CreditCard, Loader2, 
    CheckCircle2, Clock, Truck, ShieldCheck, Phone, Mail,
    Download, HelpCircle, ChevronRight, FileText, Eye, X,
    AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    cancellationRequested?: boolean
    cancellationReason?: string
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
    const [isCancelling, setIsCancelling] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    const downloadDocument = async (type: 'invoice' | 'receipt') => {
        const toastId = toast.loading(`Generating ${type}...`)
        try {
            const res = await fetch(`/api/orders/${orderId}/${type}`)
            if (!res.ok) throw new Error(`Failed to generate ${type}`)

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${type.charAt(0).toUpperCase() + type.slice(1)}-${order?.orderNumber || orderId}.pdf`
            a.click()
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

    const requestCancellation = async () => {
        if (!cancelReason.trim()) {
            toast.error("Reason required for cancellation")
            return
        }

        setIsCancelling(true)
        const toastId = toast.loading("Sending cancellation request...")
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cancellationRequested: true,
                    cancellationReason: cancelReason
                })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Request failed")
            }
            toast.success("Cancellation request submitted", { id: toastId })
            setShowCancelConfirm(false)
            fetchOrder()
        } catch (error: any) {
            toast.error(error.message, { id: toastId })
        } finally {
            setIsCancelling(false)
        }
    }

    const fetchOrder = async () => {
        if (!user || !orderId) return
        try {
            const res = await fetch(`/api/orders/${orderId}`)
            if (res.ok) {
                const data = await res.json()
                setOrder(data)
            } else {
                router.push("/dashboard/orders")
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
        const s = status.toUpperCase()
        switch (s) {
            case "PENDING":
                return { label: "Awaiting Confirmation", icon: <Clock className="w-4 h-4" />, styles: "bg-amber-50 text-amber-600 border-amber-100", step: 0 }
            case "PROCESSING":
                return { label: "Processing Order", icon: <Package className="w-4 h-4" />, styles: "bg-blue-50 text-blue-600 border-blue-100", step: 1 }
            case "SHIPPED":
                return { label: "In Transit", icon: <Truck className="w-4 h-4" />, styles: "bg-purple-50 text-purple-600 border-purple-100", step: 2 }
            case "DELIVERED":
            case "COMPLETED":
                return { label: "Delivered", icon: <CheckCircle2 className="w-4 h-4" />, styles: "bg-emerald-50 text-emerald-600 border-emerald-100", step: 3 }
            case "CANCELLED":
                return { label: "Cancelled", icon: <X className="w-4 h-4" />, styles: "bg-rose-50 text-rose-600 border-rose-100", step: -1 }
            default:
                return { label: status, icon: <Clock className="w-4 h-4" />, styles: "bg-gray-50 text-gray-600 border-gray-100", step: 0 }
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Loading Order Details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!order) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <p className="text-xl font-bold uppercase italic tracking-tighter">Order not found</p>
                    <Link href="/dashboard/orders">
                        <Button variant="link" className="mt-4 font-black uppercase tracking-widest text-[10px]">Return to History</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const currentStatus = getStatusInfo(order.status)
    const canCancel = ['PENDING', 'PROCESSING', 'ORDER PLACED'].includes(order.status.toUpperCase()) && !order.cancellationRequested

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard/orders"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
                    >
                        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                        Back to History
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => previewDocument('invoice')}
                            className="text-[10px] font-black uppercase tracking-widest gap-2 h-8 rounded-full hover:bg-muted"
                        >
                            <Eye size={14} /> Preview Invoice
                        </Button>
                    </div>
                </div>

                {/* Main Order Info Card */}
                <div className="bg-card border border-border rounded-[3rem] shadow-xl overflow-hidden">
                    {/* Status Banner */}
                    <div className={cn("p-8 sm:p-12 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden", currentStatus.styles)}>
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                            {currentStatus.icon}
                        </div>
                        <div className="flex flex-col gap-3 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Order Reference</span>
                            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase leading-none">Order <span className="not-italic">#{order.orderNumber}</span></h1>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2 relative z-10">
                            <Badge className={cn("rounded-full px-6 py-1.5 text-[10px] font-black uppercase tracking-widest border-none", currentStatus.styles)}>
                                {order.cancellationRequested ? "CANCELLATION PENDING REVIEW" : currentStatus.label}
                            </Badge>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status: Updated</span>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    {currentStatus.step >= 0 && !order.cancellationRequested && (
                        <div className="px-8 sm:px-12 py-10 border-b border-border bg-muted/20">
                            <div className="flex items-center justify-between relative px-2">
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-muted -translate-y-1/2 z-0" />
                                <div 
                                    className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 transition-all duration-1000" 
                                    style={{ width: `${(currentStatus.step / 3) * 100}%` }} 
                                />
                                {['Processing', 'Shipped', 'Delivered'].map((label, i) => {
                                    const stepIndex = i + 1
                                    const isActive = currentStatus.step >= stepIndex
                                    return (
                                        <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                                isActive ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : "bg-card border-muted text-muted-foreground"
                                            )}>
                                                {i === 0 ? <Package size={16} /> : i === 1 ? <Truck size={16} /> : <CheckCircle2 size={16} />}
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest",
                                                isActive ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Cancellation Alert */}
                    {order.cancellationRequested && (
                        <div className="px-8 sm:px-12 py-6 border-b border-border bg-amber-500/5 flex items-center gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Review in Progress</span>
                                <p className="text-xs font-bold text-muted-foreground">The support team is reviewing your cancellation request: "{order.cancellationReason}"</p>
                            </div>
                        </div>
                    )}

                    <div className="p-8 sm:p-12 space-y-12">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-border pb-12">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Order Date</span>
                                <span className="text-sm font-bold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Payment Method</span>
                                <span className="text-sm font-bold text-foreground">{order.paymentMethod}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Payment Status</span>
                                <span className={cn("text-sm font-bold uppercase", order.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-amber-500')}>{order.paymentStatus}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Amount</span>
                                <span className="text-2xl font-black italic tracking-tighter text-primary">${order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Dispatch Contents */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Package size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Order Summary</h3>
                            </div>
                            <div className="grid gap-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="group flex items-center justify-between p-6 rounded-[2rem] bg-muted/30 border border-border/50 hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-16 h-16 bg-card rounded-2xl border border-border overflow-hidden p-2 shrink-0 group-hover:scale-105 transition-transform">
                                                <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black italic uppercase tracking-tight text-foreground">{item.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.quantity} QTY • ${item.price.toLocaleString()} EACH</span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-black italic tracking-tighter text-foreground">${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 mt-8 border-t border-border">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">Shipping Address</h3>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/50 flex flex-col gap-2">
                                    <p className="text-sm font-bold text-foreground uppercase">{order.customerName}</p>
                                    <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                        {order.address}<br />
                                        {order.city}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-3">
                                        <Phone size={12} className="text-primary/50" />
                                        <span className="text-[10px] font-bold text-muted-foreground tracking-widest">{order.customerPhone}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <ShieldCheck size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">Account Actions</h3>
                                </div>
                                <div className="space-y-4">
                                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border hover:bg-muted" asChild>
                                        <Link href="/contact">
                                            <HelpCircle size={16} className="mr-3 text-primary" /> Request Modification
                                        </Link>
                                    </Button>
                                    {canCancel && (
                                        <Button 
                                            variant="ghost" 
                                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                            onClick={() => setShowCancelConfirm(true)}
                                        >
                                            <X size={16} className="mr-3" /> Cancel Order
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secure footer info */}
                <div className="flex flex-col items-center gap-4 text-center opacity-30">
                    <ShieldCheck size={40} className="text-primary" />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em]">Official SmartHub Transaction Record</p>
                </div>
            </div>

            {/* Cancellation Request Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-card border border-border shadow-2xl rounded-[3rem] p-10 flex flex-col gap-8"
                        >
                            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
                                <AlertCircle size={40} />
                            </div>
                            <div className="space-y-3 text-center">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Cancellation Request</h3>
                                <p className="text-sm text-muted-foreground font-medium">Please provide a reason for this cancellation request to be reviewed by our team.</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <textarea 
                                    className="w-full h-32 p-4 bg-muted/30 border border-border rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    placeholder="PLEASE PROVIDE REASON FOR CANCELLATION..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                />
                                
                                <div className="flex flex-col gap-3">
                                    <Button 
                                        className="h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px]"
                                        onClick={requestCancellation}
                                        disabled={isCancelling || !cancelReason.trim()}
                                    >
                                        {isCancelling ? <Loader2 className="animate-spin mr-2" /> : 'Submit Request'}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                        onClick={() => {
                                            setShowCancelConfirm(false)
                                            setCancelReason('')
                                        }}
                                        disabled={isCancelling}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                            Document Preview
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
