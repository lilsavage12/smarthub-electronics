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
import { OrderQuickView } from "@/components/admin/OrderQuickView"
import { supabase } from "@/lib/supabase"

// Define Order Interface
interface Order {
    id: string
    userId: string
    customerName: string
    customerEmail: string
    items: any[]
    totalAmount: number
    status: 'Order Placed' | 'Payment Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Completed' | 'Cancelled' | 'Returned'
    paymentStatus: string
    paymentMethod: string
    trackingNumber?: string
    courier?: string
    estimatedDelivery?: string
    createdAt: any
    updatedAt: any
    cancellationRequested?: boolean
    cancellationReason?: string
    shippingAddress: {
        fullName: string
        addressLine1: string
        city: string
        state: string
        postalCode: string
        country: string
        phone: string
    }
    transactionCode?: string
    notes?: string
}

const STATUS_COLORS: Record<string, string> = {
    'Order Placed': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    'Payment Confirmed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Processing': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Shipped': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Out for Delivery': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    'Delivered': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Returned': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

const STATUS_ICONS: Record<string, any> = {
    'Order Placed': <ShoppingBag size={12} />,
    'Payment Confirmed': <DollarSign size={12} />,
    'Processing': <Clock size={12} />,
    'Shipped': <Truck size={12} />,
    'Out for Delivery': <Package size={12} />,
    'Delivered': <Package size={12} />,
    'Completed': <ShieldCheck size={12} />,
    'Cancelled': <Ban size={12} />,
    'Returned': <RefreshCcw size={12} />,
}


export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [specialFilter, setSpecialFilter] = useState<"All" | "Unpaid" | "Sales" | "Returns">("All")
    const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'CANCEL' | 'DELETE' | 'REFUND' } | null>(null)
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
    const [trackingForm, setTrackingForm] = useState({
        status: '',
        message: '',
        notes: '',
        trackingNumber: '',
        courier: '',
        estimatedDelivery: ''
    })



    const fetchOrders = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers: any = { "Content-Type": "application/json" }
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch("/api/orders", { headers })
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

    const handleUpdateTracking = async () => {
        if (!selectedOrder) return
        const toastId = toast.loading("Updating order shipment status...")
        try {
            const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trackingForm)
            })
            if (!res.ok) throw new Error("Failed to update tracking")

            toast.success("Order shipment updated", { id: toastId })
            
            // Refresh order data
            fetchOrders()
            setIsTrackingModalOpen(false)
        } catch (error) {
            toast.error("Failed to update tracking information", { id: toastId })
        }
    }

    // Logic: Order Action Handlers
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const toastId = toast.loading(`Updating status to ${newStatus}...`)
        try {
            const targetStatus = newStatus

            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: targetStatus })
            })
            if (!res.ok) throw new Error("Failed to update order status")

            toast.success(`Order status updated to ${newStatus}`, { id: toastId })

            // Optimistic update of local records
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: targetStatus as any } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: targetStatus as any })
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update order status", { id: toastId })
        }
    }

    const cancelOrder = async (orderId: string) => {
        const toastId = toast.loading("Cancelling order...")
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'Cancelled' })
            })
            if (!res.ok) throw new Error("Failed to cancel order")

            toast.success("Order cancelled successfully", { id: toastId })
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as any } : o))
            setConfirmAction(null)
        } catch (error) {
            toast.error("Failed to cancel order", { id: toastId })
        }
    }

    const deleteOrder = async (orderId: string) => {
        const toastId = toast.loading("Deleting order from records...")
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed to delete order")

            toast.success("Order deleted successfully", { id: toastId })
            setOrders(orders.filter(o => o.id !== orderId))
            setConfirmAction(null)
            if (selectedOrder?.id === orderId) setIsDetailsOpen(false)
        } catch (error) {
            toast.error("Failed to delete order", { id: toastId })
        }
    }

    const issueRefund = async (orderId: string) => {
        const toastId = toast.loading("Processing refund...")
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: 'Refunded' })
            })
            if (!res.ok) throw new Error("Refund failed")

            toast.success("Refund processed successfully", { id: toastId })
            setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: 'Refunded' } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, paymentStatus: 'Refunded' })
            }
        } catch (error) {
            toast.error("Refund failed", { id: toastId })
        }
    }

    const updatePaymentStatus = async (orderId: string, newStatus: string) => {
        const toastId = toast.loading(`Updating payment status to ${newStatus}...`)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: newStatus })
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                let errorMsg = data.error || `Transition failed (${res.status})`
                if (data.diagnostics) {
                    const d = data.diagnostics
                    errorMsg += ` [CF: ${d.cookiesFound}, ID: ${d.identityResolved ? 'Y' : 'N'}, S: ${d.sbStatus}]`
                }

                throw new Error(errorMsg)
            }

            toast.success(`Financial Settlement: ${newStatus}`, { id: toastId })
            
            // Logic: If Refunded, automatically mark as Returned
            const additionalUpdates: any = {}
            if (newStatus === 'Refunded') {
                additionalUpdates.status = 'Returned'
                // Trigger the background status update
                fetch(`/api/orders/${orderId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: 'Returned' })
                }).catch(err => console.error("Auto-return sync failed:", err))
            }

            setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus, ...additionalUpdates } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus, ...additionalUpdates })
            }
        } catch (error: any) {
            console.error("Payment Status Transition Error:", error)
            toast.error(error.message || "Payment status update failed", { 
                id: toastId,
                duration: 5000 
                })
            }
    }

    const updateCancellation = async (orderId: string, requested: boolean, status?: string) => {
        const action = status === 'Cancelled' ? 'Authorizing Cancellation' : 'Declining Request'
        const toastId = toast.loading(`${action}...`)
        try {
            const body: any = { cancellationRequested: requested }
            if (status) body.status = status

            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error("Update failed")

            toast.success(status === 'Cancelled' ? "Order Cancelled" : "Cancellation Request Declined", { id: toastId })
            
            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, cancellationRequested: requested, status: (status || o.status) as any } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, cancellationRequested: requested, status: (status || selectedOrder.status) as any })
            }
        } catch (error) {
            toast.error("Update failed", { id: toastId })
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
        toast.success("Shipping Document Generated", { icon: "📄" })
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
        toast.success("Orders list exported")
    }
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.shippingAddress?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customerEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
        
        let matchesStatus = true
        if (specialFilter === "All") {
            matchesStatus = statusFilter === "All" || order.status === statusFilter
        } else if (specialFilter === "Unpaid") {
            matchesStatus = order.paymentStatus !== "Paid"
        } else if (specialFilter === "Sales") {
            matchesStatus = order.status === "Processing" || order.status === "Order Placed"
        } else if (specialFilter === "Returns") {
            matchesStatus = order.status === "Returned"
        }
        
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        const matchesStartDate = !dateFilter.start || orderDate >= new Date(dateFilter.start)
        const matchesEndDate = !dateFilter.end || orderDate <= new Date(dateFilter.end + "T23:59:59")

        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
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
        toast.success("Orders Exported Successfully")
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
                    <h1 className="text-3xl font-black tracking-tight text-foreground  uppercase">Order Management</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Complete control dashboard for order fulfillment and logistics.</p>
                </div>
                <div className="flex items-center gap-3">

                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="h-12 px-6 rounded-xl border-border font-black  tracking-widest uppercase text-[10px] gap-2 hover:bg-muted transition-all"
                    >
                        <Download size={18} />
                        EXPORT ORDERS
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { key: 'Sales', label: "New Sales", count: stats.processing, icon: <ShoppingBag className="text-blue-500" />, sub: "Awaiting Dispatch", bg: "bg-blue-500/5", active: specialFilter === 'Sales' },
                    { key: 'All', label: "Total Orders", count: orders.length, icon: <FileText className="text-amber-500" />, sub: "All Registries", bg: "bg-amber-500/5", active: specialFilter === 'All' },
                    { key: 'Unpaid', label: "Unpaid", count: orders.filter(o => o.paymentStatus !== 'Paid').length, icon: <ShieldAlert className="text-red-500" />, sub: "Financial Risk", bg: "bg-red-500/5", active: specialFilter === 'Unpaid' },
                    { key: 'Returns', label: "Returns", count: orders.filter(o => o.status === 'Returned').length, icon: <RefreshCcw className="text-emerald-500" />, sub: "Active RMA Process", bg: "bg-emerald-500/5", active: specialFilter === 'Returns' },
                ].map((s, i) => (
                    <Card 
                        key={i} 
                        onClick={() => {
                            setSpecialFilter(s.key as any)
                            setStatusFilter('All')
                        }}
                        className={cn(
                            "rounded-2xl border-border shadow-sm p-6 flex flex-col gap-4 group hover:shadow-md transition-all cursor-pointer",
                            s.active ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "hover:border-primary/20"
                        )}
                    >
                        <div className={cn("p-3 w-fit rounded-xl transition-colors", s.bg)}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black  tracking-tighter">{s.count}</span>
                                <span className="text-[8px] font-black uppercase text-primary mb-1">Orders</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{s.label}</span>
                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">{s.sub}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Table Interface */}
            <div className="flex flex-col gap-6 bg-card border border-border rounded-3xl lg:rounded-[2.5rem] p-4 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50 pb-8">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 bg-muted border-none rounded-xl pl-12 pr-4 text-sm font-medium"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                            {["All", "Processing", "Shipped", "Completed"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setStatusFilter(tab)
                                        setSpecialFilter('All')
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        statusFilter === tab && specialFilter === 'All'
                                            ? "bg-background text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                           <input 
                                type="date" 
                                className="h-10 bg-muted border-none rounded-xl px-3 text-[9px] font-black uppercase tracking-widest outline-none"
                                value={dateFilter.start}
                                onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                           />
                           <span className="text-muted-foreground opacity-30 text-[9px] font-black">TO</span>
                           <input 
                                type="date" 
                                className="h-10 bg-muted border-none rounded-xl px-3 text-[9px] font-black uppercase tracking-widest outline-none"
                                value={dateFilter.end}
                                onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                           />
                           {(dateFilter.start || dateFilter.end) && (
                               <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 text-rose-500 rounded-xl" 
                                    onClick={() => setDateFilter({start: "", end: ""})}
                                >
                                   <X size={14} />
                               </Button>
                           )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <th className="px-6 py-5">Order Reference</th>
                                <th className="px-6 py-5">Customer Profile</th>
                                <th className="px-6 py-5 hidden md:table-cell">Payment Status</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 hidden lg:table-cell">Method</th>
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
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ">{order.customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-foreground">KSh {Math.round(order.totalAmount).toLocaleString()}</span>
                                            <span className="text-[8px] font-black text-muted-foreground tracking-widest uppercase opacity-40">{order.items?.length || 0} ITEMS</span>
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
                                    <td className="px-6 py-6 hidden lg:table-cell">
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
                                                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl p-2 z-50 opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all transform origin-top-right scale-95 group-hover/actions:scale-100">
                                                    <div className="px-3 py-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1">Order Fulfillment</div>
                                                    {[
                                                        { tag: 'Processing', icon: <Clock size={14} /> },
                                                        { tag: 'Shipped', icon: <Truck size={14} /> },
                                                        { tag: 'Delivered', icon: <Package size={14} /> },
                                                        { tag: 'Completed', icon: <CheckCircle size={14} /> },
                                                        { tag: 'Refunded', icon: <RefreshCcw size={14} />, isPayment: true },
                                                    ].map(step => (
                                                        <button
                                                            key={step.tag}
                                                            onClick={() => step.isPayment ? updatePaymentStatus(order.id, step.tag) : updateOrderStatus(order.id, step.tag)}
                                                            className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        >
                                                            {step.icon} Mark as {step.tag}
                                                        </button>
                                                    ))}
                                                    <div className="h-px bg-border/50 my-2" />
                                                    <div className="px-3 py-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1">Payment Status</div>
                                                    {[
                                                        { tag: 'Pending', icon: <Clock size={14} /> },
                                                        { tag: 'Paid', icon: <CheckCircle2 size={14} /> },
                                                        { tag: 'Failed', icon: <AlertCircle size={14} /> },
                                                        { tag: 'Cancelled', icon: <Ban size={14} /> },
                                                    ].map(step => (
                                                        <button
                                                            key={step.tag}
                                                            onClick={() => updatePaymentStatus(order.id, step.tag)}
                                                            className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        >
                                                            {step.icon} Set as {step.tag}
                                                        </button>
                                                    ))}
                                                    <div className="h-px bg-border/50 my-2" />
                                                    <button
                                                        onClick={() => setConfirmAction({ id: order.id, type: 'CANCEL' })}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                                    >
                                                        <Ban size={14} /> Cancel Order
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmAction({ id: order.id, type: 'DELETE' })}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={14} /> Delete Order
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
                                    <h3 className="text-xl font-black uppercase  tracking-tight">Confirm Action</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confirmation Required</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed ">
                                Are you certain you wish to {
                                    confirmAction.type === 'CANCEL' ? 'permanently cancel this order' :
                                        confirmAction.type === 'REFUND' ? 'initiate a full refund for this order' :
                                            'delete this order from the records'
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

            {/* Order Quick View Panel (Synchronized Terminal) */}
            <OrderQuickView 
                order={selectedOrder as any}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onUpdateStatus={updateOrderStatus}
                onUpdatePaymentStatus={updatePaymentStatus}
                onUpdateCancellation={updateCancellation}
            />

            {/* Logistics & Tracking Management Modal */}
            <AnimatePresence>
                {isTrackingModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl flex flex-col gap-8">
                            <div className="flex items-center gap-4 text-primary">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Truck size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-black uppercase  tracking-tight">Fulfillment Status</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update Order #{selectedOrder.id.slice(0, 8)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Status</label>
                                    <select 
                                        value={trackingForm.status}
                                        onChange={(e) => setTrackingForm({...trackingForm, status: e.target.value})}
                                        className="h-12 bg-muted border-none rounded-xl px-4 text-xs font-bold uppercase tracking-widest"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Order Placed">Order Placed</option>
                                        <option value="Payment Confirmed">Payment Confirmed</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Courier</label>
                                    <Input 
                                        value={trackingForm.courier}
                                        onChange={(e) => setTrackingForm({...trackingForm, courier: e.target.value})}
                                        placeholder="E.G. FEDEX, DHL"
                                        className="h-12 bg-muted border-none rounded-xl px-4 text-xs font-bold uppercase tracking-widest"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tracking Number</label>
                                    <Input 
                                        value={trackingForm.trackingNumber}
                                        onChange={(e) => setTrackingForm({...trackingForm, trackingNumber: e.target.value})}
                                        placeholder="TRACKING NUMBER"
                                        className="h-12 bg-muted border-none rounded-xl px-4 text-xs font-bold uppercase tracking-widest"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. Delivery</label>
                                    <Input 
                                        type="date"
                                        value={trackingForm.estimatedDelivery}
                                        onChange={(e) => setTrackingForm({...trackingForm, estimatedDelivery: e.target.value})}
                                        className="h-12 bg-muted border-none rounded-xl px-4 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Message (Customer facing)</label>
                                <Input 
                                    value={trackingForm.message}
                                    onChange={(e) => setTrackingForm({...trackingForm, message: e.target.value})}
                                    placeholder="Your order is being processed..."
                                    className="h-12 bg-muted border-none rounded-xl px-4 text-xs"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Notes (Private)</label>
                                <Input 
                                    value={trackingForm.notes}
                                    onChange={(e) => setTrackingForm({...trackingForm, notes: e.target.value})}
                                    placeholder="Shipping preparation..."
                                    className="h-12 bg-muted border-none rounded-xl px-4 text-xs"
                                />
                            </div>

                            <div className="flex gap-4 mt-2">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setIsTrackingModalOpen(false)}>Abort</Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                    onClick={handleUpdateTracking}
                                >
                                    Record Update
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
