
"use client"

import React, { useState, useEffect } from "react"
import { 
    Layout, Eye, EyeOff, Save, 
    Zap, Gift, Sparkles, TrendingUp,
    ArrowUp, ArrowDown, Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

export const HomepageManager = () => {
    const [config, setConfig] = useState<any>({
        flashSale: { visible: true, order: 1, title: "FLASH SALES" },
        dailyDeals: { visible: true, order: 2, title: "TODAY'S DEALS" },
        seasonal: { visible: true, order: 3, title: "SEASONAL CAMPAIGNS" },
        featured: { visible: true, order: 4, title: "BEST SELLERS" }
    })
    const [isLoading, setIsLoading] = useState(false)
    const [editingSection, setEditingSection] = useState<string | null>(null)
    const [editData, setEditData] = useState<any>(null)

    // REAL API: Save homepage config to DB
    const saveConfig = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/config/homepage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            })
            if (res.ok) {
                toast.success("Homepage configuration synchronized successfully.")
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to save configuration")
            }
        } catch (error) {
            toast.error("Network synchronization failure.")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/config/homepage")
            if (res.ok) {
                const data = await res.json()
                setConfig(data)
            }
        } catch (error) {
            console.error("Failed to fetch homepage config")
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    const toggleVisibility = (section: string) => {
        setConfig({
            ...config,
            [section]: { ...config[section], visible: !config[section].visible }
        })
    }

    const updateTitle = (section: string, title: string) => {
        setConfig({
            ...config,
            [section]: { ...config[section], title }
        })
    }

    const moveUp = (section: string) => {
        const currentOrder = config[section].order
        if (currentOrder === 1) return
        
        const otherSection = Object.keys(config).find(k => config[k].order === currentOrder - 1)
        if (otherSection) {
            setConfig({
                ...config,
                [otherSection]: { ...config[otherSection], order: currentOrder },
                [section]: { ...config[section], order: currentOrder - 1 }
            })
        }
    }

    const moveDown = (section: string) => {
        const currentOrder = config[section].order
        const maxOrder = Object.keys(config).length
        if (currentOrder === maxOrder) return
        
        const otherSection = Object.keys(config).find(k => config[k].order === currentOrder + 1)
        if (otherSection) {
            setConfig({
                ...config,
                [otherSection]: { ...config[otherSection], order: currentOrder },
                [section]: { ...config[section], order: currentOrder + 1 }
            })
        }
    }

    const handleEditSection = (key: string) => {
        setEditingSection(key)
        setEditData({ ...config[key] })
    }

    const saveSectionSettings = () => {
        if (!editingSection || !editData) return
        setConfig({
            ...config,
            [editingSection]: { ...editData }
        })
        setEditingSection(null)
        setEditData(null)
        toast.success("Section settings updated locally. Save Architecture to persist.")
    }

    const sortedSections = Object.keys(config).sort((a, b) => config[a].order - config[b].order)

    const iconMap: { [key: string]: any } = {
        flashSale: <Zap className="text-rose-600" size={20} />,
        dailyDeals: <Gift className="text-amber-500" size={20} />,
        seasonal: <Sparkles className="text-purple-600" size={20} />,
        featured: <TrendingUp className="text-primary" size={20} />
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-black italic uppercase tracking-widest text-muted-foreground">HOMEPAGE ARCHITECTURE</h2>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Control section visibility and sequencing.</p>
                </div>
                <Button 
                    onClick={saveConfig}
                    disabled={isLoading}
                    className="h-9 px-6 rounded-xl bg-primary text-white font-black italic tracking-widest uppercase text-[10px] gap-2 shadow-xl shadow-primary/20"
                >
                    <Save size={14} />
                    {isLoading ? "SYNCING..." : "SAVE ARCHITECTURE"}
                </Button>
            </div>

            <div className="flex flex-col gap-4">
                {sortedSections.map((key) => {
                    const section = config[key]
                    return (
                        <Card key={key} className={cn(
                            "rounded-[2rem] border-border bg-card transition-all group overflow-hidden",
                            !section.visible && "opacity-50 grayscale"
                        )}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-1 items-center">
                                        <button onClick={() => moveUp(key)} className="hover:text-primary transition-colors disabled:opacity-20" disabled={section.order === 1}>
                                            <ArrowUp size={16} />
                                        </button>
                                        <span className="text-sm font-black italic text-muted-foreground">{section.order}</span>
                                        <button onClick={() => moveDown(key)} className="hover:text-primary transition-colors disabled:opacity-20" disabled={section.order === sortedSections.length}>
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>

                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                        {iconMap[key]}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Section Identity</label>
                                        <input 
                                            value={section.title}
                                            onChange={(e) => updateTitle(key, e.target.value)}
                                            className="bg-transparent border-none outline-none text-base font-black uppercase italic tracking-tight text-foreground focus:text-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1 px-4 border-r border-border">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Visibility Status</span>
                                        <button 
                                            onClick={() => toggleVisibility(key)}
                                            className={cn(
                                                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                                section.visible ? "text-emerald-500" : "text-rose-500"
                                            )}
                                        >
                                            {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {section.visible ? "VISIBLE" : "HIDDEN"}
                                        </button>
                                    </div>
                                    <Button 
                                         onClick={(e) => {
                                             e.stopPropagation()
                                             handleEditSection(key)
                                         }}
                                         variant="ghost" 
                                         size="icon" 
                                         className="h-10 w-10 text-muted-foreground hover:bg-muted rounded-xl"
                                     >
                                         <Settings2 size={18} />
                                     </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="mt-8 p-8 border-2 border-dashed border-border rounded-[3rem] bg-muted/20 flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 rounded-full bg-card shadow-xl">
                    <Layout className="text-primary" size={32} />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-black font-outfit uppercase italic tracking-tighter">Phase Architecture</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Configure additional landing nodes below.</p>
                </div>
                <Button variant="outline" className="h-10 px-6 rounded-xl text-[9px] font-black italic uppercase tracking-widest border-border hover:bg-muted mt-2">
                    ADD DYNAMIC SECTION
                </Button>
            </div>

            {/* Section Settings Modal */}
            <AnimatePresence>
                {editingSection && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-2xl relative"
                        >
                            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                                <Settings2 className="text-primary" />
                                SECTION <span className="text-primary">SETTINGS</span>
                            </h2>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">DISPLAY TITLE</label>
                                    <input 
                                        className="h-12 bg-muted/50 border border-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none transition-all"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest">VISIBILITY</span>
                                        <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Should this show on home?</span>
                                    </div>
                                    <button 
                                        onClick={() => setEditData({ ...editData, visible: !editData.visible })}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative p-1",
                                            editData.visible ? "bg-primary" : "bg-muted-foreground/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full transition-all",
                                            editData.visible ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <Button 
                                        onClick={() => setEditingSection(null)}
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl font-black uppercase italic tracking-widest text-[10px]"
                                    >
                                        DISCARD
                                    </Button>
                                    <Button 
                                        onClick={saveSectionSettings}
                                        className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase italic tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                    >
                                        APPLY CHANGES
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
