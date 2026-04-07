"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Truck, MapPin, Plus, Trash2, Edit2, Check, X,
    Search, Map as MapIcon, DollarSign, Activity, ChevronRight,
    MapPinned, Globe, Building, Navigation
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function DeliveryZonesPage() {
    const [zones, setZones] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [newZone, setNewZone] = useState({ city: "", area: "", fee: "" })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState({ city: "", area: "", fee: "" })
    const [cityFilter, setCityFilter] = useState("all")
    const [sortBy, setSortBy] = useState<"city" | "fee">("city")
    const [isAddingNewCity, setIsAddingNewCity] = useState(false)

    useEffect(() => {
        fetchZones()
    }, [])

    const fetchZones = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/delivery/zones")
            if (res.ok) {
                const data = await res.json()
                setZones(data)
            }
        } catch (err) {
            toast.error("Failed to fetch zones")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newZone.city || !newZone.area || !newZone.fee) return
        
        setIsSubmitting(true)
        const tid = toast.loading("Adding delivery zone...")
        try {
            const res = await fetch("/api/delivery/zones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newZone)
            })
            if (res.ok) {
                toast.success("Zone added successfully", { id: tid })
                setNewZone({ city: "", area: "", fee: "" })
                setIsAddOpen(false)
                fetchZones()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to add zone", { id: tid })
            }
        } catch (err) {
            toast.error("Connection error", { id: tid })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (id: string) => {
        const tid = toast.loading("Updating zone...")
        try {
            const res = await fetch("/api/delivery/zones", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...editData })
            })
            if (res.ok) {
                toast.success("Zone updated", { id: tid })
                setEditingId(null)
                fetchZones()
            } else {
                toast.error("Update failed", { id: tid })
            }
        } catch (err) {
            toast.error("Connection error", { id: tid })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will affect checkout pricing for this area.")) return

        const tid = toast.loading("Deleting zone...")
        try {
            const res = await fetch(`/api/delivery/zones?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Zone removed", { id: tid })
                fetchZones()
            } else {
                toast.error("Deletion failed", { id: tid })
            }
        } catch (err) {
            toast.error("Connection error", { id: tid })
        }
    }

    const filteredZones = zones
        .filter(z => {
            const matchesSearch = z.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 z.area.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCity = cityFilter === "all" || z.city === cityFilter
            return matchesSearch && matchesCity
        })
        .sort((a, b) => {
            if (sortBy === "city") return a.city.localeCompare(b.city)
            return Number(a.fee) - Number(b.fee)
        })

    const uniqueCities = Array.from(new Set(zones.map(z => z.city))) as string[]

    return (
        <div className="flex flex-col gap-10">
            {/* Header: Identity */}
            <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10 w-full justify-between overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black font-outfit uppercase tracking-tighter  leading-none">
                                Delivery <span className="text-primary">Fees</span>
                            </h2>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                                Management Portal
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Sort */}
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-muted/50 border-none rounded-2xl h-14 px-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none  appearance-none cursor-pointer"
                            >
                                <option value="city">SORT BY: CITY</option>
                                <option value="fee">SORT BY: FEE</option>
                            </select>
                        </div>
                        
                        {/* City Filter */}
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="bg-muted/50 border-none rounded-2xl h-14 px-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none  appearance-none cursor-pointer"
                        >
                            <option value="all">ALL CITIES</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city.toUpperCase()}</option>
                            ))}
                        </select>

                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="FIND AREA..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-muted/50 border-none rounded-2xl h-14 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none md:w-48 "
                            />
                        </div>

                        {/* Add Button */}
                        <Button 
                            onClick={() => setIsAddOpen(true)}
                            className="h-14 px-8 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest gap-2 "
                        >
                            <Plus size={18} />
                            Add New
                        </Button>
                    </div>
                </div>
            </div>


            {/* Main Listing */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]  text-muted-foreground border-b border-border">City</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]  text-muted-foreground border-b border-border">Area</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]  text-muted-foreground border-b border-border">Delivery fee</th>
                                <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em]  text-muted-foreground border-b border-border">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <Activity className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing logistics data...</span>
                                        </td>
                                    </tr>
                                ) : filteredZones.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <MapIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No zones matching your search</span>
                                        </td>
                                    </tr>
                                ) : filteredZones.map((zone) => (
                                    <motion.tr 
                                        key={zone.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-muted/10 transition-all font-inter"
                                    >
                                        <td className="p-6">
                                            {editingId === zone.id ? (
                                                <input 
                                                    value={editData.city}
                                                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                                    className="bg-background border border-border rounded-xl px-4 h-11 text-[11px] font-bold uppercase w-full outline-none focus:border-primary"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary/20 shrink-0" />
                                                    <span className="text-sm font-black tracking-tight text-foreground uppercase">{zone.city}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {editingId === zone.id ? (
                                                <input 
                                                    value={editData.area}
                                                    onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                                                    className="bg-background border border-border rounded-xl px-4 h-11 text-[11px] font-bold uppercase w-full outline-none focus:border-primary"
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{zone.area}</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {editingId === zone.id ? (
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">KSH</span>
                                                    <input 
                                                        type="number"
                                                        value={editData.fee}
                                                        onChange={(e) => setEditData({ ...editData, fee: e.target.value })}
                                                        className="bg-background border border-border rounded-xl pl-12 pr-4 h-11 text-[11px] font-black w-full outline-none focus:border-primary"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-md font-black  font-outfit tracking-tighter leading-none",
                                                        Number(zone.fee) === 0 ? "text-emerald-500" : "text-foreground"
                                                    )}>
                                                        {Number(zone.fee) === 0 ? "FREE" : `KSH ${Math.round(Number(zone.fee)).toLocaleString()}`}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === zone.id ? (
                                                    <>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => handleUpdate(zone.id)}
                                                            className="h-10 w-10 text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                                                        >
                                                            <Check size={18} />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => setEditingId(null)}
                                                            className="h-10 w-10 text-muted-foreground hover:bg-muted rounded-xl"
                                                        >
                                                            <X size={18} />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => {
                                                                setEditingId(zone.id)
                                                                setEditData({ city: zone.city, area: zone.area, fee: zone.fee.toString() })
                                                            }}
                                                            className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        >
                                                            <Edit2 size={18} />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => handleDelete(zone.id)}
                                                            className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Zone Portal (Drawer) */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-lg bg-card border-l border-border h-full relative z-10 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-10 flex flex-col gap-10">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter  leading-none">Create <span className="text-primary ">Distribution</span> Zone</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground  opacity-60">Expand your logistics network.</p>
                                </div>

                                <form onSubmit={handleAdd} className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Target City</label>
                                        {!isAddingNewCity ? (
                                            <div className="relative group">
                                                <select
                                                    required
                                                    value={newZone.city}
                                                    onChange={(e) => {
                                                        if (e.target.value === "ADD_NEW") {
                                                            setIsAddingNewCity(true)
                                                            setNewZone({ ...newZone, city: "" })
                                                        } else {
                                                            setNewZone({ ...newZone, city: e.target.value })
                                                        }
                                                    }}
                                                    className="w-full h-14 bg-muted/30 border border-border rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none cursor-pointer "
                                                >
                                                    <option value="">SELECT CITY</option>
                                                    {uniqueCities.map(city => (
                                                        <option key={city} value={city}>{city.toUpperCase()}</option>
                                                    ))}
                                                    <option value="ADD_NEW" className="text-primary font-bold">+ ADD NEW CITY</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <input 
                                                    required
                                                    autoFocus
                                                    placeholder="ENTER NEW CITY NAME..."
                                                    value={newZone.city}
                                                    onChange={(e) => setNewZone({ ...newZone, city: e.target.value.toUpperCase() })}
                                                    className="w-full h-14 bg-muted/30 border border-border rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAddingNewCity(false)
                                                        setNewZone({ ...newZone, city: "" })
                                                    }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary hover:underline uppercase"
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Target Area</label>
                                        <input 
                                            required
                                            placeholder="E.G. WESTLANDS"
                                            value={newZone.area}
                                            onChange={(e) => setNewZone({ ...newZone, area: e.target.value.toUpperCase() })}
                                            className="h-14 bg-muted/30 border border-border rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Custom Shipping Fee (KSH)</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <input 
                                                required
                                                type="number"
                                                placeholder="250"
                                                value={newZone.fee}
                                                onChange={(e) => setNewZone({ ...newZone, fee: e.target.value })}
                                                className="h-14 bg-muted/30 border border-border rounded-2xl pl-16 pr-6 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-10">
                                        <Button 
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="h-16 rounded-2xl bg-primary text-xs font-black  tracking-[0.2em] shadow-xl shadow-primary/20 gap-3"
                                        >
                                            {isSubmitting ? 'SYNCING...' : 'CONFIRM ZONE'}
                                            <ChevronRight size={18} />
                                        </Button>
                                        <Button 
                                            type="button"
                                            onClick={() => {
                                                setIsAddOpen(false)
                                                setIsAddingNewCity(false)
                                            }}
                                            variant="ghost"
                                            className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100"
                                        >
                                            CLOSE PANEL
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
