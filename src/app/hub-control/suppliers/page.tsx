"use client"

import React, { useState } from "react"
import {
    Users, Search, Filter, Mail, Phone,
    MapPin, ShoppingBag, DollarSign, Star,
    MoreHorizontal, Edit2, Trash2, Eye,
    ChevronRight, ArrowRight, Zap, ShieldCheck,
    MessageSquare, History, UserPlus, Download, Plus,
    Globe, Smartphone, Truck, Package, Clock, CheckCircle2, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const SAMPLE_SUPPLIERS = [
    { id: "SUP-01", name: "Apple Global Distribution", location: "Cupertino, CA, US", category: "Hardware (Direct)", quality: 99.8, status: "Preferred", statusColor: "text-emerald-500 bg-emerald-50", leadTime: "3d", activePO: 4 },
    { id: "SUP-02", name: "Samsung Logistics", location: "Suwon, KR", category: "Hardware (Direct)", quality: 98.5, status: "Preferred", statusColor: "text-emerald-500 bg-emerald-50", leadTime: "5d", activePO: 2 },
    { id: "SUP-03", name: "Atlas Hardware Dist.", location: "Amsterdam, NL", category: "Hardware (Retailer)", quality: 94.2, status: "Standard", statusColor: "text-slate-500 bg-slate-50", leadTime: "2d", activePO: 0 },
    { id: "SUP-04", name: "Xiaomi Tech Hub", location: "Beijing, CN", category: "Hardware (Global)", quality: 92.0, status: "Caution", statusColor: "text-amber-500 bg-amber-50", leadTime: "12d", activePO: 1 },
]

const ACTIVE_PO = [
    { id: "PO-7721", supplier: "Apple Global", items: "12x iPhone 16 Pro", value: "$11,200", status: "In Transit", arrival: "2h ago" },
    { id: "PO-7722", supplier: "Samsung Logistics", items: "8x S24 Ultra", value: "$7,992", status: "Processing", arrival: "In 3d" },
]

export default function SuppliersPage() {
    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Manage Suppliers</h1>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Manage company contacts and supply partners.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border font-black italic uppercase tracking-widest text-[10px] gap-2">
                        <Download size={18} />
                        EXPORT SUPPLIER DATA
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/10 transition-all hover:opacity-90">
                        <Plus size={20} />
                        ADD NEW ORDER
                    </Button>
                </div>
            </div>

            {/* Procurement KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Suppliers", value: "24 Units", icon: <Globe size={20} className="text-primary" />, sub: "Global Distribution" },
                    { label: "Pending Orders", value: "8 Orders", icon: <Package size={20} className="text-primary" />, sub: "$42K Order Value" },
                    { label: "Avg Lead Time", box: "4.2 Days", icon: <Clock size={20} className="text-primary" />, sub: "Fast Delivery Velocity" },
                    { label: "Quality Rating", value: "96.4%", icon: <Star size={20} className="text-primary" />, sub: "Performance Index" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border shadow-sm p-6 bg-card flex flex-col gap-4 group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">{stat.label}</span>
                                <div className="p-2 bg-muted group-hover:bg-primary/10 rounded-lg group-hover:text-primary transition-colors">{stat.icon}</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase">{stat.value || stat.box}</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 opacity-60 italic leading-none">{stat.sub}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Supplier Matrix Hub */}
                <Card className="xl:col-span-2 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                    <CardHeader className="p-8 border-b border-border">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black italic tracking-tight uppercase">Suppliers</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-none">Database of all active suppliers</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-muted">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-5">Supplier Name</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5">Quality</th>
                                        <th className="px-8 py-5">Lead Time</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {SAMPLE_SUPPLIERS.map((sup, i) => (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors">{sup.name}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground tracking-widest leading-none mt-1 uppercase italic opacity-60">{sup.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground italic opacity-60 tracking-widest">{sup.category}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black italic text-foreground uppercase tracking-widest">{sup.quality}%</span>
                                                    <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${sup.quality}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black italic text-foreground uppercase tracking-widest">
                                                    <Clock size={12} className="text-muted-foreground opacity-50 mt-0.5" />
                                                    {sup.leadTime}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5 transition-all">
                                                        <Eye size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Procurement Insights */}
                <div className="flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card transition-colors">
                        <CardHeader className="p-8 border-b border-border">
                            <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Active Orders</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                {ACTIVE_PO.map((po, i) => (
                                    <div key={i} className="p-5 bg-muted border border-border/50 rounded-2xl flex flex-col gap-3 group hover:border-primary/20 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase italic tracking-widest text-primary leading-none">{po.id}</span>
                                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border leading-none transition-colors", po.status === "In Transit" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border")}>
                                                {po.status === "In Transit" && <Truck size={10} />}
                                                {po.status}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-[10px] font-black uppercase text-foreground italic group-hover:text-primary transition-colors">{po.supplier}</h4>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60 leading-none">{po.items}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                            <span className="text-[11px] font-black italic text-foreground italic uppercase tracking-widest">{po.value}</span>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 leading-none italic">{po.arrival}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="h-12 w-full rounded-2xl border-border text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">
                                VIEW ALL ORDERS
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card p-8 transition-colors">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Supply Index</span>
                                <p className="text-[10px] font-black leading-relaxed italic opacity-60 uppercase mt-2 tracking-widest">Orders optimized for fast delivery.</p>
                            </div>
                            <div className="h-[1px] w-full bg-border" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Smartphone size={18} className="text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-foreground leading-none tracking-widest italic">Contact System Active</span>
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest italic opacity-80 mt-1">9 Verified Partners</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
