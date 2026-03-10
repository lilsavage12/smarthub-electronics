"use client"

import React, { useState } from "react"
import {
    FileText, Download, Calendar, Search,
    Filter, MoreHorizontal, FileSpreadsheet,
    Printer, Info, Plus, Clock, CheckCircle2,
    Smartphone, User, Zap, Star, ShieldCheck,
    Layers, Package, CreditCard, ShoppingCart, Globe, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const SAMPLE_REPORTS = [
    { id: "REP-9201", name: "Monthly Financial Audit", date: "2026-03-01", type: "Financial", size: "2.4 MB", status: "Generated", format: "PDF" },
    { id: "REP-9202", name: "Hardware Inventory Delta", date: "2026-03-01", type: "Inventory", size: "1.8 MB", status: "Generated", format: "XLSX" },
    { id: "REP-9203", name: "Customer Affinity Report", date: "2026-02-15", type: "CRM", size: "3.2 MB", status: "Archive", format: "PDF" },
    { id: "REP-9204", name: "Regional Sales Analysis (Asia)", date: "2026-02-10", type: "Sales", size: "4.1 MB", status: "Archive", format: "PDF" },
    { id: "REP-9205", name: "Supplier Performance Hub", date: "2026-02-05", type: "Supply Chain", size: "1.2 MB", status: "Archive", format: "XLSX" },
]

export default function ReportsPage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportType, setReportType] = useState("Financial Summary")
    const [reportFormat, setReportFormat] = useState("PDF")

    const handleGenerate = () => {
        setIsGenerating(true)
        const toastId = toast.loading(`Generating ${reportType} (${reportFormat})...`)
        setTimeout(() => {
            setIsGenerating(false)
            toast.success("Intelligence Document Generated & Archived", { id: toastId })
        }, 2000)
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-b-2 border-slate-100 pb-2">Intelligence Archive & Reports</h1>
                    <p className="text-sm font-medium text-slate-500 tracking-tight mt-1 opacity-80 uppercase tracking-widest text-[10px]">Structured hardware exports & business intelligence logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="h-12 px-8 rounded-xl bg-slate-900 text-white font-black italic uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95 border-none"
                    >
                        {isGenerating ? <Zap size={18} className="animate-spin text-primary" /> : <Plus size={20} className="text-primary" />}
                        {isGenerating ? "PROCESSING..." : "GENERATE INTEL"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Generation Control */}
                <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Request Generation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Report Type</label>
                                <select
                                    className="h-12 w-full bg-slate-50 border border-transparent rounded-2xl px-4 outline-none text-xs font-bold uppercase tracking-widest focus:border-primary/20 transition-all"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option>Financial Summary</option>
                                    <option>Inventory Audit</option>
                                    <option>Customer Retention</option>
                                    <option>Supply Logistics</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Temporal Period</label>
                                <select className="h-12 w-full bg-slate-50 border border-transparent rounded-2xl px-4 outline-none text-xs font-bold uppercase tracking-widest focus:border-primary/20 transition-all">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Quarterly (Q1 2026)</option>
                                    <option>Custom Range</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Export Protocol</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setReportFormat("PDF")}
                                        className={cn(
                                            "h-12 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            reportFormat === "PDF" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-400"
                                        )}
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => setReportFormat("XLSX")}
                                        className={cn(
                                            "h-12 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            reportFormat === "XLSX" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-transparent text-slate-400"
                                        )}
                                    >
                                        XLSX
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="h-14 w-full rounded-2xl bg-primary text-white font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-[10px]"
                        >
                            {isGenerating ? "INITIALIZING..." : "INITIALIZE EXPORT"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Archive Data Hub */}
                <Card className="xl:col-span-3 rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-extrabold tracking-tight">Intelligence Archive</CardTitle>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Historical data exports & audit trails</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search archive..." className="h-10 pl-9 pr-4 bg-slate-50 rounded-lg text-xs outline-none border border-transparent focus:border-primary/20 w-48" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-slate-50/50">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-8 py-5">Intel Name & ID</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5 text-right">Payload Size</th>
                                        <th className="px-8 py-5">Status Protocol</th>
                                        <th className="px-8 py-5 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {SAMPLE_REPORTS.map((rep, i) => (
                                        <tr key={rep.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors">
                                                        {rep.format === "PDF" ? <FileText size={20} className="text-red-500" /> : <FileSpreadsheet size={20} className="text-emerald-500" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-extrabold text-slate-900 tracking-tight">{rep.name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{rep.id} • {rep.date}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase text-slate-500 italic opacity-80">{rep.type}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-xs font-black italic text-slate-400 group-hover:text-slate-900 transition-colors uppercase">{rep.size}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none", rep.status === "Generated" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600")}>
                                                    {rep.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-primary rounded-xl">
                                                        <Download size={18} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Financial Audits", icon: <CreditCard className="text-blue-500" /> },
                    { label: "Inventory Health", icon: <Package className="text-emerald-500" /> },
                    { label: "Dispatch Velocity", icon: <Globe className="text-purple-500" /> },
                    { label: "System Health", icon: <ShieldCheck className="text-amber-500" /> }
                ].map((box, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-slate-100 shadow-sm p-8 bg-white group hover:bg-slate-900 transition-all cursor-pointer">
                        <div className="flex flex-col gap-6">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white/10 w-fit transition-colors">
                                {React.cloneElement(box.icon as React.ReactElement<any>, { size: 24 })}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-black uppercase text-slate-900 group-hover:text-white transition-colors">{box.label}</h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Automated Hub Logs</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all">
                                <span className="text-[10px] font-black uppercase italic">Access Database</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
