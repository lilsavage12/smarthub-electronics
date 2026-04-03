
"use client"

import React, { useState, useEffect } from "react"
import { 
    Layout, Type, Palette, Eye, Save, Upload, 
    Settings, FileText, Receipt, CheckCircle2,
    ChevronRight, Info, AlertCircle, Trash2,
    RefreshCcw, Smartphone, Monitor, Printer
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TemplateSettings {
    id?: string
    templateType: 'invoice' | 'receipt'
    storeName: string
    storeAddress: string
    storeContact: string
    websiteUrl: string
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    headerBgColor: string
    tableHeaderColor: string
    textColor: string
    fontFamily: string
    fontSize: string
    headerLayout: 'standard' | 'minimal' | 'modern'
    footerText: string
    sectionVisibility: {
        [key: string]: boolean
    }
}

const DEFAULT_INVOICE: TemplateSettings = {
    templateType: 'invoice',
    storeName: 'SmartHub Electronics',
    storeAddress: '123 Tech Avenue, Silicon Valley',
    storeContact: '+1 (555) 123-4567',
    websiteUrl: 'www.smarthub.com',
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#0F0F12',
    headerBgColor: '#0F0F12',
    tableHeaderColor: '#0F0F12',
    textColor: '#323232',
    fontFamily: 'helvetica',
    fontSize: '10',
    headerLayout: 'standard',
    footerText: 'Thank you for choosing SmartHub Electronics.',
    sectionVisibility: {
        storeHeader: true,
        invoiceNumber: true,
        customerInfo: true,
        billingAddress: true,
        orderSummary: true,
        productTable: true,
        taxBreakdown: true,
        shippingFee: true,
        totalAmount: true,
        paymentMethod: true,
        footerMessage: true
    }
}

const DEFAULT_RECEIPT: TemplateSettings = {
    templateType: 'receipt',
    storeName: 'SmartHub Electronics',
    storeAddress: '123 Tech Avenue, Silicon Valley',
    storeContact: '+1 (555) 123-4567',
    websiteUrl: 'www.smarthub.com',
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#0F0F12',
    headerBgColor: '#0F0F12',
    tableHeaderColor: '#0F0F12',
    textColor: '#323232',
    fontFamily: 'helvetica',
    fontSize: '10',
    headerLayout: 'modern',
    footerText: 'Thank you for your purchase!',
    sectionVisibility: {
        storeHeader: true,
        orderId: true,
        paymentConfirmation: true,
        productList: true,
        amountPaid: true,
        paymentMethod: true,
        transactionRef: true,
        thankYouMessage: true
    }
}

const SAMPLE_DATA = {
    orderNumber: 'INV-2026-88',
    date: new Date().toLocaleDateString(),
    customerName: 'Marcus Holloway',
    customerEmail: 'marcus@dedsec.io',
    address: 'Bay Bridge Towers, SF',
    items: [
        { name: 'X-Gen Quantum Processor', qty: 1, price: 1299 },
        { name: 'Holographic Display Gen-3', qty: 2, price: 450 }
    ],
    total: 2199,
    tax: 219.9,
    method: 'Credit Card (Stripe)'
}

export default function DocumentTemplates() {
    const [activeTab, setActiveTab] = useState<'invoice' | 'receipt'>('invoice')
    const [settings, setSettings] = useState<{ invoice: TemplateSettings, receipt: TemplateSettings }>({
        invoice: DEFAULT_INVOICE,
        receipt: DEFAULT_RECEIPT
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState<'desktop' | 'print'>('desktop')

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/templates')
            if (res.ok) {
                const data = await res.json()
                const newSettings = { ...settings }
                data.forEach((template: any) => {
                    if (template.templateType === 'invoice') newSettings.invoice = template
                    if (template.templateType === 'receipt') newSettings.receipt = template
                })
                setSettings(newSettings)
            }
        } catch (error) {
            console.error("Failed to load templates")
        } finally {
            setLoading(false)
        }
    }

    const current = settings[activeTab]

    const updateSetting = (key: keyof TemplateSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [key]: value
            }
        }))
    }

    const toggleSection = (section: string) => {
        setSettings(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                sectionVisibility: {
                    ...prev[activeTab].sectionVisibility,
                    [section]: !prev[activeTab].sectionVisibility[section]
                }
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        const toastId = toast.loading(`Saving ${activeTab} configuration...`)
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(current)
            })
            if (!res.ok) throw new Error("Database error")
            
            toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} template updated`, { id: toastId })
        } catch (error) {
            toast.error("Failed to save changes", { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCcw className="w-8 h-8 animate-spin text-primary opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading designs...</span>
        </div>
    )

    return (
        <div className="flex flex-col gap-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Document Templates</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Customize and preview your business documents.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="h-12 px-8 rounded-xl font-black italic tracking-widest uppercase text-[10px] gap-2 shadow-xl shadow-primary/20"
                    >
                        <Save size={18} />
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl w-fit border border-border/50">
                <button 
                    onClick={() => setActiveTab('invoice')}
                    className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'invoice' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <FileText size={16} /> Official Invoice
                </button>
                <button 
                    onClick={() => setActiveTab('receipt')}
                    className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'receipt' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Receipt size={16} /> Quick Receipt
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Editor Sidebar */}
                <div className="xl:col-span-5 flex flex-col gap-8">
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Settings className="text-primary" size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Configuration</span>
                            </div>
                            <Badge variant="outline" className="rounded-lg text-[8px] font-black uppercase">{activeTab}</Badge>
                        </div>

                        <div className="p-8 flex flex-col gap-8 overflow-y-auto max-h-[700px] no-scrollbar">
                            {/* Branding Section */}
                            <div className="flex flex-col gap-4">
                                <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                    <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center rounded-md border-primary/30 text-primary">1</Badge>
                                    Identity & Branding
                                </span>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Business Name</label>
                                        <Input 
                                            value={current.storeName}
                                            onChange={(e) => updateSetting('storeName', e.target.value)}
                                            className="h-11 bg-muted/50 border-none rounded-xl text-xs font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Business Address</label>
                                        <Input 
                                            value={current.storeAddress}
                                            onChange={(e) => updateSetting('storeAddress', e.target.value)}
                                            className="h-11 bg-muted/50 border-none rounded-xl text-xs font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Contact Information</label>
                                            <Input 
                                                value={current.storeContact}
                                                onChange={(e) => updateSetting('storeContact', e.target.value)}
                                                className="h-11 bg-muted/50 border-none rounded-xl text-xs font-bold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Website URL</label>
                                            <Input 
                                                value={current.websiteUrl}
                                                onChange={(e) => updateSetting('websiteUrl', e.target.value)}
                                                className="h-11 bg-muted/50 border-none rounded-xl text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* Aesthetics Section */}
                            <div className="flex flex-col gap-4">
                                <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                    <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center rounded-md border-primary/30 text-primary">2</Badge>
                                    Visual Aesthetics
                                </span>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Primary Color</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={current.primaryColor}
                                                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                                                className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer p-0"
                                            />
                                            <Input 
                                                value={current.primaryColor} 
                                                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                                                className="h-10 text-[10px] font-mono border-none bg-muted/50 rounded-lg text-center" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Header Color</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={current.headerBgColor}
                                                onChange={(e) => updateSetting('headerBgColor', e.target.value)}
                                                className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer p-0"
                                            />
                                            <Input 
                                                value={current.headerBgColor} 
                                                onChange={(e) => updateSetting('headerBgColor', e.target.value)}
                                                className="h-10 text-[10px] font-mono border-none bg-muted/50 rounded-lg text-center" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Font Family</label>
                                    <select 
                                        value={current.fontFamily}
                                        onChange={(e) => updateSetting('fontFamily', e.target.value)}
                                        className="h-11 bg-muted/50 border-none rounded-xl px-4 text-xs font-bold appearance-none outline-none"
                                    >
                                        <option value="helvetica">Helvetica</option>
                                        <option value="times">Times New Roman</option>
                                        <option value="courier">Courier New</option>
                                    </select>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* Section Toggles */}
                            <div className="flex flex-col gap-4">
                                <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                    <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center rounded-md border-primary/30 text-primary">3</Badge>
                                    Section Visibility
                                </span>
                                <div className="grid grid-cols-2 gap-x-10 gap-y-4 pt-2">
                                    {Object.keys(current.sectionVisibility).map(section => (
                                        <div key={section} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleSection(section)}>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                                                {section.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <div className={cn(
                                                "w-10 h-5 rounded-full transition-all flex items-center p-1",
                                                current.sectionVisibility[section] ? "bg-primary" : "bg-muted"
                                            )}>
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full bg-white transition-all transform",
                                                    current.sectionVisibility[section] ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Live Preview Panel */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Live Preview</span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setPreviewMode('desktop')}
                                    className={cn("p-2 rounded-lg transition-all", previewMode === 'desktop' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
                                >
                                    <Monitor size={14} />
                                </button>
                                <button 
                                    onClick={() => setPreviewMode('print')}
                                    className={cn("p-2 rounded-lg transition-all", previewMode === 'print' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
                                >
                                    <Printer size={14} />
                                </button>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] animate-pulse">LIVE PREVIEW</Badge>
                    </div>

                    <div className={cn(
                        "bg-slate-900 rounded-[3rem] p-6 md:p-12 shadow-2xl transition-all duration-700 overflow-hidden",
                        previewMode === 'print' ? "aspect-[1/1.4] scale-95" : "min-h-[800px]"
                    )}>
                        {/* Mock PDF Rendering Area */}
                        <div 
                            className="bg-white w-full h-full rounded-2xl shadow-inner flex flex-col p-8 md:p-12 text-slate-800"
                            style={{ 
                                fontFamily: current.fontFamily === 'helvetica' ? 'Helvetica, sans-serif' : 
                                            current.fontFamily === 'times' ? 'Times New Roman, serif' : 'Courier New, monospace',
                                fontSize: `${current.fontSize}pt`
                            }}
                        >
                            {/* Header */}
                            {current.sectionVisibility.storeHeader && (
                                <div 
                                    className="p-8 -mx-10 -mt-10 mb-8 flex flex-col md:flex-row justify-between items-start"
                                    style={{ backgroundColor: current.headerBgColor, color: '#fff' }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{current.storeName}</h2>
                                        <p className="text-[8px] opacity-70 tracking-widest">{current.storeAddress}</p>
                                        <p className="text-[8px] opacity-70 tracking-widest">{current.storeContact}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                                        <span className="text-xl font-black tracking-tight">{activeTab.toUpperCase()}</span>
                                        <p className="text-[8px] opacity-70 mt-1">{current.websiteUrl}</p>
                                    </div>
                                </div>
                            )}

                            {/* Reference Info */}
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client Information</span>
                                    <p className="font-black text-sm">{SAMPLE_DATA.customerName}</p>
                                    <p className="text-[9px]">{SAMPLE_DATA.customerEmail}</p>
                                    <p className="text-[9px]">{SAMPLE_DATA.address}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</span>
                                        <p className="font-black text-sm">{SAMPLE_DATA.orderNumber}</p>
                                    </div>
                                    <div className="flex flex-col items-end mt-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                                        <p className="font-bold text-[10px]">{SAMPLE_DATA.date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Product Table Mock */}
                            <div className="flex-1">
                                <table className="w-full text-left text-[9px] border-collapse">
                                    <thead>
                                        <tr style={{ backgroundColor: current.tableHeaderColor, color: '#fff' }}>
                                            <th className="p-3 font-black uppercase tracking-widest rounded-l-lg">Product / Service</th>
                                            <th className="p-3 font-black uppercase tracking-widest text-center">Qty</th>
                                            <th className="p-3 font-black uppercase tracking-widest text-center">Unit Price</th>
                                            <th className="p-3 font-black uppercase tracking-widest text-right rounded-r-lg">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {SAMPLE_DATA.items.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold">{item.name}</td>
                                                <td className="p-4 text-center font-bold">{item.qty}</td>
                                                <td className="p-4 text-center font-medium">${item.price.toLocaleString()}</td>
                                                <td className="p-4 text-right font-black">${(item.qty * item.price).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Summary */}
                            <div className="mt-10 flex flex-col items-end gap-2 border-t pt-8">
                                <div className="flex justify-between w-64 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>${(SAMPLE_DATA.total - SAMPLE_DATA.tax).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between w-64 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                                    <span>Tax (10%)</span>
                                    <span>${SAMPLE_DATA.tax.toLocaleString()}</span>
                                </div>
                                <div 
                                    className="flex justify-between w-64 mt-4 p-4 rounded-xl text-white font-black italic shadow-lg"
                                    style={{ backgroundColor: current.primaryColor }}
                                >
                                    <span className="uppercase text-[9px] mt-1">Total Amount</span>
                                    <span className="text-xl">${SAMPLE_DATA.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            {current.sectionVisibility.footerMessage && (
                                <div className="mt-auto pt-10 border-t border-slate-100 flex flex-col items-center gap-4 opacity-70">
                                    <p className="text-center italic text-[9px] font-bold max-w-sm">{current.footerText}</p>
                                    <div className="flex gap-10">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-[1px] bg-slate-200 mb-2" />
                                            <span className="text-[6px] font-black uppercase tracking-[0.3em]">Signature</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-[1px] bg-slate-200 mb-2" />
                                            <span className="text-[6px] font-black uppercase tracking-[0.3em]">Date Signed</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
