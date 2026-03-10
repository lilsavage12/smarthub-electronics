"use client"

import React, { useState, useEffect } from "react"
import {
    Search, Filter, Download, MoreHorizontal, Eye,
    Truck, Package, CheckCircle2, AlertCircle, Clock,
    X, Printer, Trash2, Calendar, User, CreditCard,
    ArrowUpRight, ShoppingBag, ShieldCheck, RefreshCcw,
    ChevronDown, ChevronUp, FileText, Ban, DollarSign,
    CheckCircle, ShieldAlert, Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Define Order Interface
interface Order {
    id: string
    userId: string
    customerName: string
    customerEmail: string
    items: any[]
    totalAmount: number
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled' | 'Returned'
    paymentStatus: string
    paymentMethod: string
    createdAt: any
    updatedAt: any
    shippingAddress: {
        fullName: string
        addressLine1: string
        city: string
        state: string
        postalCode: string
        country: string
        phone: string
    }
}

const STATUS_COLORS: Record<string, string> = {
    'Processing': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Shipped': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Delivered': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Returned': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

const STATUS_ICONS: Record<string, any> = {
    'Processing': <Clock size={12} />,
    'Shipped': <Truck size={12} />,
    'Delivered': <BoxIcon size={12} />,
    'Completed': <ShieldCheck size={12} />,
    'Cancelled': <Ban size={12} />,
    'Returned': <RefreshCcw size={12} />,
}

function BoxIcon({ size = 12 }: { size?: number }) {
    return <Package size={size} />
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'CANCEL' | 'DELETE' | 'REFUND' } | null>(null)



    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Postgres Orders Sync Error:", error)
            toast.error("Failed to sync orders")
        } finally {
            setLoading(false)
        }
    }

    // Refresh data periodically or on mount
    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [])

    // Logic: Order Action Handlers
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const toastId = toast.loading(`Updating order to ${newStatus}...`)
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error("Failed to update status")

            toast.success(`Order set to ${newStatus}`, { id: toastId })

            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any })
            }
        } catch (error) {
            toast.error("Failed to update order status", { id: toastId })
        }
    }

    const cancelOrder = async (orderId: string) => {
        const toastId = toast.loading("Cancelling order sequence...")
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'Cancelled' })
            })
            if (!res.ok) throw new Error("Failed to cancel order")

            toast.success("Order cancelled effectively", { id: toastId })
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as any } : o))
            setConfirmAction(null)
        } catch (error) {
            toast.error("Failed to cancel order", { id: toastId })
        }
    }

    const deleteOrder = async (orderId: string) => {
        const toastId = toast.loading("Purging order from registries...")
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed to delete order entry")

            toast.success("Order entry deleted definitively", { id: toastId })
            setOrders(orders.filter(o => o.id !== orderId))
            setConfirmAction(null)
            if (selectedOrder?.id === orderId) setIsDetailsOpen(false)
        } catch (error) {
            toast.error("Failed to delete order entry", { id: toastId })
        }
    }

    const issueRefund = async (orderId: string) => {
        const toastId = toast.loading("Processing financial reversal protocol...")
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: 'Refunded', status: 'Returned' })
            })
            if (!res.ok) throw new Error("Refund protocol failed")

            toast.success("Refund processed successfully", { id: toastId })
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Returned' as any, paymentStatus: 'Refunded' } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: 'Returned' as any, paymentStatus: 'Refunded' })
            }
        } catch (error) {
            toast.error("Refund protocol failed", { id: toastId })
        }
    }

    const handlePrint = () => {
        // Add a temporary style tag for print formatting
        const style = document.createElement('style')
        style.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                .print-area, .print-area * { visibility: visible; }
                .print-area { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%;
                    padding: 40px !important;
                    background: white !important;
                    color: black !important;
                }
                .no-print { display: none !important; }
                button { display: none !important; }
                .rounded-2xl, .rounded-3xl, .rounded-[3.5rem] { border-radius: 0 !important; }
                .bg-muted, .bg-card { background: transparent !important; border: 1px solid #eee !important; }
                .shadow-2xl, .shadow-xl { shadow: none !important; }
                table { width: 100% !important; border-collapse: collapse !important; }
                th, td { border: 1px solid #eee !important; padding: 12px !important; }
            }
        `
        document.head.appendChild(style)
        window.print()
        document.head.removeChild(style)
        toast.success("Manifest Generated", { icon: "📄" })
    }
    const exportOrdersCSV = () => {
        const headers = ["Order ID", "Date", "Customer", "Email", "Amount", "Status", "Payment", "Items Count"]
        const data = filteredOrders.map(o => [
            o.id,
            o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A',
            o.customerName || o.shippingAddress?.fullName || 'Anonymous',
            o.customerEmail || 'No Email',
            o.totalAmount,
            o.status,
            o.paymentMethod,
            o.items?.length || 0
        ])
        const csvContent = [headers, ...data].map(row => row.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `smarthub_orders_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        toast.success("Orders manifest exported")
    }
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.shippingAddress?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "All" || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleExport = () => {
        const headers = "Order ID,Date,Customer,Total,Status,Payment\n"
        const rows = filteredOrders.map(o => {
            const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A'
            return `${o.id},${date},${o.customerName},${o.totalAmount},${o.status},${o.paymentMethod}`
        }).join("\n")
        const blob = new Blob([headers + rows], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `inventory_orders_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success("Registry Exported Successfully")
    }



    const stats = {
        processing: orders.filter(o => o.status === 'Processing').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        verification: orders.filter(o => o.status === 'Returned' || o.paymentStatus !== 'Paid').length,
        delivered: orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length,
    }

    return (
        <div className="flex flex-col gap-10 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Orders Registry</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Complete audit and logistics control hub for client acquisition.</p>
                </div>
                <div className="flex items-center gap-3">

                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="h-12 px-6 rounded-xl border-border font-black italic tracking-widest uppercase text-[10px] gap-2 hover:bg-muted transition-all"
                    >
                        <Download size={18} />
                        EXPORT REGISTRY
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "New Sales", count: stats.processing, icon: <ShoppingBag className="text-blue-500" />, sub: "Awaiting Dispatch", bg: "bg-blue-500/5" },
                    { label: "Shipping", count: stats.shipped, icon: <Truck className="text-amber-500" />, sub: "Active In-Transit", bg: "bg-amber-500/5" },
                    { label: "Verification", count: stats.verification, icon: <ShieldAlert className="text-red-500" />, sub: "Security Checks Reqd", bg: "bg-red-500/5" },
                    { label: "Returns", count: orders.filter(o => o.status === 'Returned').length, icon: <RefreshCcw className="text-emerald-500" />, sub: "Active RMA Sequence", bg: "bg-emerald-500/5" },
                ].map((s, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className={cn("p-3 w-fit rounded-xl transition-colors", s.bg)}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black italic tracking-tighter">{s.count}</span>
                                <span className="text-[8px] font-black uppercase text-primary mb-1">Orders</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">{s.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Table Interface */}
            <div className="flex flex-col gap-6 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50 pb-8">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Universal search sequence..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 bg-muted border-none rounded-xl pl-12 pr-4 text-sm font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                        {["All", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    statusFilter === tab
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <th className="px-6 py-5">Order Reference</th>
                                <th className="px-6 py-5">Customer Profile</th>
                                <th className="px-6 py-5">Financial Audit</th>
                                <th className="px-6 py-5 text-center">Status Matrix</th>
                                <th className="px-6 py-5">Clearance</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-muted rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="group hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-foreground tracking-tight uppercase">#{order.id.slice(0, 8)}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                                                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-foreground">{order.customerName || order.shippingAddress?.fullName}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">{order.customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-foreground">${order.totalAmount.toLocaleString()}</span>
                                            <span className="text-[8px] font-black text-muted-foreground tracking-widest uppercase opacity-40">{order.items?.length || 0} ASSETS</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex justify-center">
                                            <Badge variant="outline" className={cn("px-4 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest gap-2 flex items-center shadow-sm", STATUS_COLORS[order.status])}>
                                                {STATUS_ICONS[order.status]}
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", order.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
                                                className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                            >
                                                <Eye size={18} />
                                            </Button>
                                            <div className="relative group/actions">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted group-hover/actions:bg-muted">
                                                    <MoreHorizontal size={18} />
                                                </Button>
                                                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all transform origin-top-right scale-95 group-hover/actions:scale-100">
                                                    <div className="px-3 py-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1">Logistics Flow</div>
                                                    {[
                                                        { tag: 'Processing', icon: <Clock size={14} /> },
                                                        { tag: 'Shipped', icon: <Truck size={14} /> },
                                                        { tag: 'Delivered', icon: <Package size={14} /> },
                                                        { tag: 'Completed', icon: <CheckCircle size={14} /> },
                                                    ].map(step => (
                                                        <button
                                                            key={step.tag}
                                                            onClick={() => updateOrderStatus(order.id, step.tag)}
                                                            className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        >
                                                            {step.icon} Mark as {step.tag}
                                                        </button>
                                                    ))}
                                                    <div className="h-px bg-border/50 my-2" />
                                                    <button
                                                        onClick={() => setConfirmAction({ id: order.id, type: 'CANCEL' })}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                                    >
                                                        <Ban size={14} /> Cancel Sequence
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmAction({ id: order.id, type: 'DELETE' })}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={14} /> Purge Entry
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6">
                            <div className="flex items-center gap-4 text-red-500">
                                <div className="p-3 bg-red-500/10 rounded-2xl">
                                    <ShieldAlert size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Security Alert</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Confirmation Required</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                                Are you certain you wish to {
                                    confirmAction.type === 'CANCEL' ? 'permanently terminate this order sequence' :
                                        confirmAction.type === 'REFUND' ? 'initiate a full financial reversal for this asset' :
                                            'purge this order entry from the registry'
                                }? This action is non-reversible.
                            </p>
                            <div className="flex gap-4 mt-2">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setConfirmAction(null)}>Abort</Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest"
                                    onClick={() => {
                                        if (confirmAction.type === 'CANCEL') cancelOrder(confirmAction.id);
                                        else if (confirmAction.type === 'REFUND') issueRefund(confirmAction.id);
                                        else deleteOrder(confirmAction.id);
                                    }}
                                >
                                    Confirm Action
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Order Details Inspection Modal (High Fidelity) */}
            <AnimatePresence>
                {isDetailsOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-5xl bg-card border border-border/50 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print-area"
                        >
                            <div className="p-10 border-b border-border/30 flex items-center justify-between bg-muted/20">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn("px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm", STATUS_COLORS[selectedOrder.status])}>
                                            {selectedOrder.status}
                                        </Badge>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest border-l border-border pl-3">REF: #{selectedOrder.id}</span>
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase mt-2">Asset Inspection</h2>
                                    <div className="hidden print:block text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">SmartHub Electronics Ltd • Digital Manifest</div>
                                </div>
                                <div className="flex items-center gap-4 no-print">
                                    <Button onClick={handlePrint} variant="outline" className="h-12 w-12 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all"><Printer size={20} /></Button>
                                    <button onClick={() => setIsDetailsOpen(false)} className="h-12 w-12 flex items-center justify-center bg-muted hover:bg-muted/80 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-muted/[0.02]">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2 flex flex-col gap-10">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-3 text-primary">
                                                <ShoppingBag size={20} />
                                                <span className="text-xs font-black uppercase tracking-widest mt-0.5">Hardware Registry</span>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted/20 border border-border/10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="h-20 w-20 bg-card rounded-2xl border border-border/50 relative p-3 flex items-center justify-center">
                                                                <Image src={item.image || "/images/product-placeholder.png"} fill className="object-contain p-2" alt="p" />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-lg font-black text-foreground tracking-tight">{item.name}</span>
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">QTY: {item.quantity} UNIT(S) • UID: {item.id?.slice(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xl font-black italic">${item.price.toLocaleString()}</span>
                                                            <span className="text-[9px] font-bold text-primary uppercase">MSRP VALUATION</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-10">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-3 text-primary"><User size={20} /> <span className="text-xs font-black uppercase tracking-widest">Client Audit</span></div>
                                            <div className="p-8 rounded-[2.5rem] bg-muted/40 border border-border/20 flex flex-col gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black italic">{selectedOrder.customerName || selectedOrder.shippingAddress?.fullName}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{selectedOrder.customerEmail}</span>
                                                </div>
                                                <div className="h-px bg-border/50" />
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black uppercase text-primary mb-1">Logistics Destination</span>
                                                    <p className="text-xs font-medium text-foreground leading-relaxed">
                                                        {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}<br />
                                                        {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.postalCode}<br />
                                                        {selectedOrder.shippingAddress?.country}<br />
                                                        <span className="font-black mt-2 inline-block">TEL: {selectedOrder.shippingAddress?.phone}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-3 text-primary"><DollarSign size={20} /> <span className="text-xs font-black uppercase tracking-widest">Audit Summary</span></div>
                                            <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground flex flex-col gap-6 shadow-xl shadow-primary/20">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase">Financial Settlement</span>
                                                    <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-[8px]">{selectedOrder.paymentStatus}</Badge>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-5xl font-black italic tracking-tighter">${selectedOrder.totalAmount.toLocaleString()}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-2">VIA {selectedOrder.paymentMethod} PROTOCOL</span>
                                                </div>
                                                {selectedOrder.paymentStatus !== 'Refunded' && (
                                                    <Button
                                                        onClick={() => setConfirmAction({ id: selectedOrder.id, type: 'REFUND' })}
                                                        className="w-full bg-white text-primary hover:bg-white/90 font-black italic uppercase tracking-widest text-[10px] h-12 rounded-xl mt-2 shadow-xl shadow-black/10 no-print"
                                                    >
                                                        ISSUE REFUND
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12 pt-8 border-t border-border/30 hidden print:block">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Generated by Hub Control v4.2</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Timestamp: {new Date().toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-4">
                                            <div className="w-32 h-[1px] bg-black/20" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Authorized Signature</span>
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
