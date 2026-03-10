"use client"

import React, { useState } from "react"
import {
    Zap, TrendingUp, BarChart3, Clock,
    AlertTriangle, CheckCircle2, Truck,
    Layers, Search, Filter, Plus,
    ArrowRight, History, Info, BarChart,
    Shield, RefreshCw, Smartphone, Package,
    Factory, Globe, Cpu, BrainCircuit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

const AI_FORECASTS = [
    { model: "iPhone 16 Pro Max", current: 8, predicted_30d: 45, confidence: 94, action: "Reorder: 40 Units", status: "Critical", statusColor: "text-red-500 bg-red-500/10" },
    { model: "Samsung S24 Ultra", current: 0, predicted_30d: 32, confidence: 88, action: "Reorder: 35 Units", status: "Critical", statusColor: "text-red-500 bg-red-500/10" },
    { model: "Lumina ZX", current: 45, predicted_30d: 38, confidence: 91, action: "None Required", status: "Healthy", statusColor: "text-emerald-500 bg-emerald-500/10" },
    { model: "Xiaomi 14 Ultra", current: 3, predicted_30d: 12, confidence: 82, action: "Reorder: 10 Units", status: "Low Stock", statusColor: "text-amber-500 bg-amber-500/10" },
    { model: "Google Pixel 9", current: 112, predicted_30d: 40, confidence: 96, action: "Pause Inbound", status: "Overstock", statusColor: "text-blue-500 bg-blue-500/10" },
]

export default function SupplyChainPage() {
    const router = useRouter()
    const [isSimulatingAI, setIsSimulatingAI] = useState(false)

    const handleAISync = () => {
        setIsSimulatingAI(true)
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2500)),
            {
                loading: 'Updating stock predictions...',
                success: 'Supply information updated',
                error: 'Sync Error: Prediction Interrupted',
            },
            {
                style: {
                    background: '#0F172A',
                    color: '#fff',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '800'
                }
            }
        ).finally(() => setIsSimulatingAI(false))
    }

    const handleViewLogs = () => {
        router.push("/hub-control/audit")
    }

    const handleManageSuppliers = () => {
        router.push("/hub-control/suppliers")
    }

    const handleAction = (item: any) => {
        if (item.action === "None Required") {
            toast.success("Stock levels are healthy. No action needed.")
            return
        }

        const actionType = item.action.startsWith("Reorder") ? "Reorder" : "Stock Adjustment"
        toast.loading(`Processing ${actionType} for ${item.model}...`, {
            duration: 2000,
            style: {
                background: '#0F172A',
                color: '#fff',
                borderRadius: '16px',
            }
        })

        setTimeout(() => {
            toast.success(`${actionType} authorized: ${item.action}`)
        }, 2000)
    }

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit className="text-primary" size={18} />
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">Smart Supply System</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Supply Chain Management</h1>
                    <p className="text-sm font-medium text-muted-foreground tracking-tight">AI-driven sales forecasting & automatic stock updates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleAISync}
                        disabled={isSimulatingAI}
                        className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold gap-2 shadow-lg shadow-primary/10"
                    >
                        {isSimulatingAI ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                        REFRESH PREDICTIONS
                    </Button>
                </div>
            </div>

            {/* AI Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Prediction Accuracy", value: "96.4%", detail: "Delta -0.2% vs Prev", icon: <TrendingUp className="text-emerald-500" /> },
                    { label: "Automatic Orders", value: "12", detail: "Active Reorders", icon: <Package className="text-blue-500" /> },
                    { label: "Cost Savings", value: "$4.2K", detail: "Order Optimization", icon: <Smartphone className="text-amber-500" /> },
                    { label: "System Sync", value: "100%", detail: "Cloud Connection Vital", icon: <Shield className="text-purple-500" /> }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-border/50 shadow-sm p-4 lg:p-6 bg-card flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">{stat.label}</span>
                            <div className="p-2 bg-muted group-hover:bg-primary/5 rounded-xl transition-colors">{stat.icon}</div>
                        </div>
                        <div className="flex flex-col mt-2">
                            <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2 tracking-widest leading-none">{stat.detail}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Demand Prediction Matrix */}
                <Card className="xl:col-span-2 rounded-2xl lg:rounded-[2.5rem] border-border/40 shadow-sm overflow-hidden bg-card">
                    <CardHeader className="p-4 lg:p-8 border-b border-border/30 flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">Stock Prediction Table</CardTitle>
                            <span className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest italic">System: Sales History Tracker</span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleViewLogs}
                            className="h-10 px-4 rounded-xl border-border text-muted-foreground font-bold text-[10px] gap-2"
                        >
                            <History size={16} />
                            VIEW SYSTEM LOGS
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-inter">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-8 py-5">Product Model</th>
                                    <th className="px-8 py-5">Stock Prediction</th>
                                    <th className="px-8 py-5">Prediction Score</th>
                                    <th className="px-8 py-5">Recommended Action</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {AI_FORECASTS.map((item, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border border-border/40 group-hover:border-primary/20 transition-colors">
                                                    <Smartphone size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-extrabold text-foreground tracking-tight">{item.model}</span>
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", item.statusColor.replace('bg-', 'text-').split(' ')[0])}>
                                                        {item.status}: {item.current} Units
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-black text-foreground tracking-tight">{item.predicted_30d} Units</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">30-DAY PREDICTION</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                                                    <span className="text-muted-foreground/60 italic">Accuracy</span>
                                                    <span className="text-foreground">{item.confidence}%</span>
                                                </div>
                                                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.confidence}%` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                item.action.startsWith("Reorder") ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {item.action}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleAction(item)}
                                                className="h-10 w-10 text-slate-400 hover:text-primary rounded-xl"
                                            >
                                                <Plus size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Automation Silos & Global Supply */}
                <div className="flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white p-8 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -z-1" />
                        <div className="flex flex-col gap-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Shipping Speed</span>
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <Globe size={18} className="text-primary" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black italic tracking-tighter leading-none">Fast Shipping</span>
                                <span className="text-[9px] font-bold opacity-60 uppercase mt-2 tracking-widest">Logistics Status: 84% Efficiency</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "84%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed opacity-60 italic mt-2">
                                "Calculated data shows no delays in hardware delivery routes for the next 72 hours."
                            </p>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border/40 shadow-sm bg-card p-8 font-inter">
                        <div className="flex flex-col gap-8">
                            <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">Supplier Performance</CardTitle>
                            <div className="flex flex-col gap-6">
                                {[
                                    { label: "Apple Global (Express)", val: 98, icon: <Factory size={16} /> },
                                    { label: "Samsung Logistics", val: 92, icon: <Cpu size={16} /> },
                                    { label: "Xiaomi Tech Port", val: 89, icon: <Package size={16} /> }
                                ].map((sup, i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">{sup.icon}</span>
                                                <span className="text-[10px] font-black uppercase text-foreground tracking-tighter">{sup.label}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-primary">{sup.val}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sup.val}%` }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={handleManageSuppliers}
                                className="w-full h-14 rounded-2xl border border-border text-[11px] font-black uppercase tracking-widest text-foreground gap-2 hover:bg-muted bg-card"
                            >
                                <Truck size={18} />
                                MANAGE ALL SUPPLIERS
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
