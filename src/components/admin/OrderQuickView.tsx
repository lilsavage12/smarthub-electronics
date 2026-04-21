'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    X, 
    Truck, 
    CreditCard, 
    User, 
    Package, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    MapPin, 
    Phone, 
    Mail, 
    Calendar,
    ChevronRight,
    Loader2,
    Coins
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AutoScroller } from "./AutoScroller"
import Image from 'next/image'

interface OrderItem {
    id: string
    name: string
    quantity: number
    price: number
    originalPrice?: number
    image: string
}

interface Order {
    id: string
    orderNumber: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    totalAmount: number
    status: string
    paymentMethod: string
    paymentStatus: string
    address: string
    city: string
    createdAt: string
    items?: OrderItem[]
    shippingAddress?: any
    cancellationRequested?: boolean
    cancellationReason?: string
    transactionCode?: string
    notes?: string
    area?: string
    deliveryFee?: number
}

interface OrderQuickViewProps {
    order: Order | null
    isOpen: boolean
    onClose: () => void
    onUpdateStatus: (orderId: string, status: string) => Promise<void>
    onUpdatePaymentStatus: (orderId: string, status: string) => Promise<void>
    onUpdateCancellation?: (orderId: string, requested: boolean, status?: string) => Promise<void>
}

const STATUS_OPTIONS = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Delivered',
    'Completed',
    'Cancelled',
    'Refunded'
]

const PAYMENT_STATUS_OPTIONS = [
    'Pending',
    'Paid',
    'Failed',
    'Cancelled'
]

const STATUS_THEMES: Record<string, { bg: string, text: string, icon: any }> = {
    'Order Placed': { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-400', icon: Clock },
    'Pending': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
    'Processing': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Loader2 },
    'Shipped': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: Truck },
    'Delivered': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
    'Completed': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
    'Cancelled': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle },
}

export const OrderQuickView: React.FC<OrderQuickViewProps> = ({ 
    order, 
    isOpen, 
    onClose, 
    onUpdateStatus,
    onUpdatePaymentStatus,
    onUpdateCancellation
}) => {
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('')
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
    const [isUpdatingCancellation, setIsUpdatingCancellation] = useState(false)

    React.useEffect(() => {
        if (order) {
            setSelectedStatus(order.status)
            setSelectedPaymentStatus(order.paymentStatus)
        }
    }, [order])

    if (!order) return null

    const handleStatusUpdate = async () => {
        if (selectedStatus === order.status) return
        setIsUpdatingStatus(true)
        try {
            if (selectedStatus === 'Refunded') {
                // If user selected Refunded in the logistics list, update payment status AND status
                await onUpdatePaymentStatus(order.id, 'Refunded')
                await onUpdateStatus(order.id, 'Returned')
                setSelectedStatus('Returned')
            } else {
                await onUpdateStatus(order.id, selectedStatus)
            }
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handlePaymentUpdate = async () => {
        if (selectedPaymentStatus === order.paymentStatus) return
        setIsUpdatingPayment(true)
        try {
            await onUpdatePaymentStatus(order.id, selectedPaymentStatus)
            
            // Logic: Auto-Return if Refunded
            if (selectedPaymentStatus === 'Refunded') {
                await onUpdateStatus(order.id, 'Returned')
                setSelectedStatus('Returned')
            }
        } finally {
            setIsUpdatingPayment(false)
        }
    }

    const handleCancellationApproval = async (approved: boolean) => {
        if (!onUpdateCancellation) return
        setIsUpdatingCancellation(true)
        try {
            if (approved) {
                // Set status to Cancelled and clear request
                await onUpdateCancellation(order.id, false, 'Cancelled')
            } else {
                // Just clear request
                await onUpdateCancellation(order.id, false)
            }
        } finally {
            setIsUpdatingCancellation(false)
        }
    }

    const currentTheme = STATUS_THEMES[order.status] || STATUS_THEMES['Pending']
    const StatusIcon = currentTheme.icon

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl z-[101] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-muted-foreground">Order</span>
                                    <span className="text-sm font-bold text-foreground">#{order.orderNumber || order.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={cn("rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none", currentTheme.bg, currentTheme.text)}>
                                        <StatusIcon size={12} className={cn("mr-1.5", order.status === 'Processing' && "animate-spin")} />
                                        {order.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <AutoScroller trigger={order.id} />
                            <div className="p-6 flex flex-col gap-8">
                                
                                {/* Cancellation Mediation Alert */}
                                {order.cancellationRequested && (
                                    <Card className="p-6 border-amber-200 bg-amber-50/50 shadow-sm flex flex-col gap-5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 text-amber-500">
                                            <AlertCircle size={60} />
                                        </div>
                                        <div className="flex items-center gap-3 text-amber-600 relative z-10 font-black uppercase tracking-widest text-[10px]">
                                            <AlertCircle size={16} />
                                            Cancellation Request
                                        </div>
                                        <div className="flex flex-col gap-2 relative z-10">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cancellation Reason:</span>
                                            <p className="text-xs font-bold text-foreground leading-relaxed">
                                                "{order.cancellationReason || 'No details provided'}"
                                            </p>
                                        </div>
                                        <div className="flex gap-3 relative z-10 pt-2">
                                            <Button 
                                                onClick={() => handleCancellationApproval(true)}
                                                disabled={isUpdatingCancellation}
                                                className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-red-500/20"
                                            >
                                                {isUpdatingCancellation ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                                Approve Cancellation
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleCancellationApproval(false)}
                                                disabled={isUpdatingCancellation}
                                                className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-amber-200 hover:bg-amber-100/50"
                                            >
                                                Reject Request
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                                
                                {/* Status & Financial Control Matrix */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logistics Terminal Controller */}
                                    <Card className="p-5 border-border/50 shadow-sm flex flex-col gap-4 bg-muted/10 relative overflow-hidden group">
                                         <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform">
                                            <Truck size={60} />
                                        </div>
                                        <div className="flex items-center gap-3 text-primary relative z-10">
                                            <Loader2 size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Order Status</span>
                                        </div>
                                        <div className="flex flex-col gap-3 relative z-10">
                                            <select 
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            >
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <Button 
                                                onClick={handleStatusUpdate}
                                                disabled={isUpdatingStatus || selectedStatus === order.status}
                                                className="w-full h-10 text-[10px] font-black uppercase tracking-widest gap-2"
                                            >
                                                {isUpdatingStatus ? <Loader2 size={14} className="animate-spin" /> : 'Update Status'}
                                            </Button>
                                        </div>
                                    </Card>

                                    {/* Financial Manifest Controller */}
                                    <Card className="p-5 border-border/50 shadow-sm flex flex-col gap-4 bg-muted/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform">
                                            <CreditCard size={60} />
                                        </div>
                                        <div className="flex items-center gap-3 text-primary relative z-10">
                                            <Coins size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Payment Status</span>
                                        </div>
                                        <div className="flex flex-col gap-3 relative z-10">
                                            <select 
                                                value={selectedPaymentStatus}
                                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            >
                                                {PAYMENT_STATUS_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <Button 
                                                onClick={handlePaymentUpdate}
                                                disabled={isUpdatingPayment || selectedPaymentStatus === order.paymentStatus}
                                                className="w-full h-10 text-[10px] font-black uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl"
                                            >
                                                {isUpdatingPayment ? <Loader2 size={14} className="animate-spin" /> : 'Update Payment'}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>

                                {/* Customer Registry */}
                                <Card className="p-5 border-border/50 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                        <User size={80} />
                                    </div>
                                    <div className="flex items-center gap-3 text-primary relative z-10">
                                        <User size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Customer Information</span>
                                    </div>
                                    <div className="flex flex-col relative z-10">
                                        <span className="text-lg font-black  uppercase tracking-tighter text-foreground">{order.customerName}</span>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                                            <a href={`mailto:${order.customerEmail}`} className="text-[11px] font-bold text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                                                <Mail size={12} className="text-primary/50" /> {order.customerEmail}
                                            </a>
                                            {(order.customerPhone || order.shippingAddress?.phone) && (
                                                <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                                                    <Phone size={12} className="text-primary/50" /> {order.customerPhone || order.shippingAddress?.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                {/* Order Items */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[10px]">
                                            <Package size={16} />
                                            Items Ordered ({order.items?.length || 0})
                                        </div>
                                        <span className="text-xs font-bold text-foreground">Total: KSh {Math.round(order.totalAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/5 group hover:bg-muted/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-background border border-border flex items-center justify-center p-1 relative overflow-hidden">
                                                        <Image src={item.image} fill className="object-contain p-1" alt={item.name} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-muted-foreground">{item.quantity} x KSh {Math.round(item.price || 0).toLocaleString()}</span>
                                                            {item.originalPrice && item.originalPrice > item.price && (
                                                                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-md uppercase tracking-widest leading-relaxed">
                                                                    Save {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-foreground">KSh {Math.round((item.price || 0) * item.quantity).toLocaleString()}</span>
                                                    {item.originalPrice && item.originalPrice > item.price && (
                                                        <span className="text-[9px] text-muted-foreground line-through opacity-50">KSh {Math.round(item.originalPrice * item.quantity).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping & Payment Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Shipping Info */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[10px]">
                                            <MapPin size={16} />
                                            Shipping Details
                                        </div>
                                        <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 text-xs flex flex-col gap-2 ">
                                            <p className="font-bold text-foreground not-">{order.customerName}</p>
                                            <p className="text-muted-foreground leading-relaxed not-">
                                                <span className="font-black text-foreground">{order.city}</span> - <span className="font-bold">{order.area || 'General'} Area</span><br />
                                                <span className="opacity-70">{order.address}</span>
                                            </p>
                                            {order.notes && (
                                                <div className="mt-4 pt-4 border-t border-border/30 flex flex-col gap-2">
                                                    <span className="text-[9px] font-black uppercase text-primary tracking-widest  flex items-center gap-2">
                                                        <Clock size={12} />
                                                        DELIVERY NOTE
                                                    </span>
                                                    <p className="not- text-foreground font-black tracking-tight leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                        "{order.notes}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[10px]">
                                            <CreditCard size={16} />
                                            Payment Details
                                        </div>
                                        <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 text-xs flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Gateway</span>
                                                <span className="font-bold text-foreground uppercase tracking-widest text-[10px]">{order.paymentMethod}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Payment Status</span>
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] font-bold border-none",
                                                    order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                )}>
                                                    {order.paymentStatus.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between pb-2">
                                                <span className="text-muted-foreground">Delivery Fee</span>
                                                <span className="font-bold text-foreground">KSh {(order.deliveryFee || 0).toLocaleString()}</span>
                                            </div>
                                            {order.transactionCode && (
                                                <div className="flex flex-col gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 mt-2">
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest ">VERIFICATION CODE</span>
                                                    <span className="text-sm font-black tracking-widest text-foreground select-all">{order.transactionCode}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                                                <span className="text-muted-foreground font-bold ">Total Amount</span>
                                                <span className="text-lg font-black text-foreground">KSh {Math.round(order.totalAmount || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={onClose} className="text-xs font-bold uppercase tracking-widest">Close View</Button>
                            <Button className="text-xs font-bold uppercase tracking-widest group gap-2" onClick={() => window.print()}>
                                Print Order <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
