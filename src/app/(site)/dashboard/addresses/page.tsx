"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Plus, Edit2, Trash2, Check, X, ShieldCheck, Phone, Globe, Home } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import DashboardLayout from "@/components/customer/DashboardLayout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Address {
    id: string
    fullName: string
    phone: string
    street: string
    city: string
    postalCode: string
    country: string
    isDefault: boolean
}

export default function AddressesPage() {
    const { user, isInitialized } = useAuth()
    const router = useRouter()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        postalCode: "",
        country: "Kenya",
        isDefault: false
    })

    useEffect(() => {
        if (!isInitialized) return

        if (!user) {
            router.push("/login")
            return
        }

        fetchAddresses()
    }, [user, router])

    if (!user) return null

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`/api/addresses?userId=${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setAddresses(data)
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.fullName || !formData.phone || !formData.street || !formData.city) {
            toast.error("Please fill in all required fields")
            return
        }

        const tid = toast.loading(editingId ? "Updating address..." : "Saving address...")

        try {
            if (editingId) {
                const res = await fetch("/api/addresses", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingId, userId: user.id })
                })
                if (res.ok) {
                    toast.success("Address updated", { id: tid })
                    fetchAddresses()
                }
            } else {
                const res = await fetch("/api/addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, userId: user.id })
                })
                if (res.ok) {
                    toast.success("Address added", { id: tid })
                    fetchAddresses()
                }
            }
            resetForm()
        } catch (error) {
            toast.error("Failed to save address", { id: tid })
        }
    }

    const handleEdit = (address: Address) => {
        setFormData({
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode || "",
            country: address.country || "Kenya",
            isDefault: address.isDefault
        })
        setEditingId(address.id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this address?")) return

        const tid = toast.loading("Removing address...")
        try {
            const res = await fetch(`/api/addresses?id=${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Address removed", { id: tid })
                fetchAddresses()
            }
        } catch (error) {
            toast.error("Failed to remove address", { id: tid })
        }
    }

    const handleSetDefault = async (address: Address) => {
        const tid = toast.loading("Setting as default...")
        try {
            const res = await fetch("/api/addresses", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...address, userId: user.id, isDefault: true })
            })
            if (res.ok) {
                toast.success("Default address updated", { id: tid })
                fetchAddresses()
            }
        } catch (error) {
            toast.error("Failed to update default address", { id: tid })
        }
    }

    const resetForm = () => {
        setFormData({
            fullName: "",
            phone: "",
            street: "",
            city: "",
            postalCode: "",
            country: "Kenya",
            isDefault: false
        })
        setEditingId(null)
        setShowForm(false)
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Shipping Addresses</h1>
                        <p className="text-muted-foreground">
                            Manage where your orders are delivered
                        </p>
                    </div>
                    {!showForm && (
                        <Button 
                            onClick={() => setShowForm(true)}
                            className="rounded-2xl h-12 px-6 font-black uppercase italic tracking-widest text-[10px]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Address
                        </Button>
                    )}
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border-2 border-primary/20 rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 sm:p-8 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                            <h2 className="text-2xl font-bold uppercase italic tracking-tighter">
                                {editingId ? "Update Address" : "New Address"}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recipient Name *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                        required
                                        placeholder="E.G. JOHN DOE"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                        required
                                        placeholder="+254 XXX XXX XXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Street Address *</label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                    required
                                    placeholder="APARTMENT, STREET, AREA"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                        required
                                        placeholder="CITY"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Postal Code</label>
                                    <input
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                        placeholder="00100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary accent-primary"
                                />
                                <label htmlFor="isDefault" className="text-sm font-bold uppercase tracking-widest">
                                    Set as default shipping address
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border">
                                <Button type="submit" className="flex-1 rounded-2xl h-14 font-black uppercase italic tracking-widest">
                                    {editingId ? "Update address" : "Save address"}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest border-2">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Address List */}
                {addresses.length === 0 && !showForm ? (
                    <div className="bg-card border-2 border-border border-dashed rounded-[3rem] p-16 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
                            <MapPin className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-2xl font-bold mb-2">No addresses yet</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Add your delivery coordinates so we can dispatch your gadgets as quickly as possible.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setShowForm(true)}
                            className="rounded-2xl px-12 h-14 uppercase tracking-widest text-[10px] font-black italic shadow-xl shadow-primary/10"
                        >
                            Add Address
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={cn(
                                    "bg-card border-2 rounded-[2.5rem] p-8 transition-all duration-300 relative overflow-hidden group",
                                    address.isDefault ? "border-primary shadow-xl shadow-primary/5" : "border-border hover:border-primary/30"
                                )}
                            >
                                {address.isDefault && (
                                    <div className="absolute top-0 right-0 bg-primary px-6 py-1.5 rounded-bl-3xl text-[9px] font-black text-primary-foreground uppercase tracking-[0.2em] italic">
                                        Default Destination
                                    </div>
                                )}

                                <div className="space-y-5 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                                            <Home className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <p className="font-bold text-xl uppercase italic tracking-tighter">{address.fullName}</p>
                                    </div>
                                    
                                    <div className="space-y-3 pl-1">
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                                            <span>{address.street}, {address.city} {address.postalCode}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                            <Globe className="w-4 h-4 text-primary shrink-0" />
                                            <span>{address.country}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                            <Phone className="w-4 h-4 text-primary shrink-0" />
                                            <span>{address.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-6 border-t border-border mt-auto">
                                    {!address.isDefault && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSetDefault(address)}
                                            className="text-[9px] font-black uppercase tracking-[0.2em] hover:text-primary p-0 h-auto"
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                    <div className="ml-auto flex gap-2">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent hover:bg-primary/10 hover:text-primary transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent hover:bg-rose-500/10 hover:text-rose-500 transition-all text-muted-foreground"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Secure Badge */}
                <div className="p-6 bg-accent/30 rounded-3xl flex items-center gap-4 border border-border/50">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                        Your shipping information is protected with industry-standard encryption. We never share your delivery details with third-party logistics until your order is dispatched.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    )
}
