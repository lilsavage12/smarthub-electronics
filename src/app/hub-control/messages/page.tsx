"use client"

import React, { useState, useEffect } from "react"
import { 
    MessageSquare, Search, Filter, Trash2, 
    Eye, CheckCircle2, AlertCircle, Clock,
    ChevronDown, Mail, User, ShieldCheck, 
    X, Loader2, ArrowRight, CornerUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ContactMessage {
    id: string
    name: string
    email: string
    subject: string
    message: string
    status: string
    createdAt: string
}

export default function MessagesManager() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchMessages = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/contact")
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error)
            toast.error("Failed to synchronize messages")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true)
        const toastId = toast.loading(`Updating inquiry status to ${newStatus}...`)
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                const updated = await res.json()
                setMessages(messages.map(m => m.id === id ? updated : m))
                if (selectedMessage?.id === id) setSelectedMessage(updated)
                toast.success(`Inquiry marked as ${newStatus}`, { id: toastId })
            } else {
                throw new Error("Transition failed")
            }
        } catch (error) {
            toast.error("Status update failed", { id: toastId })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteMessage = async (id: string) => {
        const toastId = toast.loading("Deleting inquiry...")
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setMessages(messages.filter(m => m.id !== id))
                if (selectedMessage?.id === id) setSelectedMessage(null)
                toast.success("Inquiry deleted", { id: toastId })
            } else {
                throw new Error("Deletion failed")
            }
        } catch (error) {
            toast.error("Deletion failed", { id: toastId })
        }
    }

    const filteredMessages = messages.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.subject.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || m.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const unreadCount = messages.filter(m => m.status === "UNREAD").length

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-foreground  uppercase leading-none">Inquiry Management</h1>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-none mt-2">
                        Received <span className="text-primary ">{messages.length}</span> customer communications
                        {unreadCount > 0 && <span className="ml-2 text-red-500">• {unreadCount} PENDING ACTION</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 px-4 bg-muted/50 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        <option value="ALL">All Inquiries</option>
                        <option value="UNREAD">Unread</option>
                        <option value="READ">Read</option>
                    </select>
                </div>
            </div>

            {/* Message List View */}
            <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
                <div className="p-8 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH INQUIRIES..." 
                            className="h-12 bg-muted/40 border-none rounded-2xl py-2 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground h-14">
                                <th className="px-8 py-4">Customer</th>
                                <th className="px-8 py-4">Subject / Message</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-center">Received At</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="h-24 animate-pulse opacity-20">
                                        <td colSpan={5} className="px-8"><div className="h-10 bg-muted rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <tr 
                                        key={msg.id} 
                                        onClick={() => setSelectedMessage(msg)}
                                        className={cn(
                                            "hover:bg-muted/30 transition-all duration-300 group cursor-pointer h-24",
                                            msg.status === "UNREAD" ? "bg-primary/[0.02]" : ""
                                        )}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center border border-border transition-all",
                                                    msg.status === "UNREAD" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "bg-muted text-muted-foreground"
                                                )}>
                                                    <User size={18} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-black uppercase  tracking-tighter text-foreground group-hover:text-primary transition-colors">{msg.name}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{msg.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1 max-w-xs">
                                                <span className="text-[10px] font-black uppercase  tracking-tight text-foreground line-clamp-1">{msg.subject}</span>
                                                <p className="text-[10px] font-medium text-muted-foreground truncate leading-none mt-1 opacity-60">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="outline" className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none",
                                                msg.status === "UNREAD" ? "bg-amber-500/10 text-amber-500" :
                                                msg.status === "READ" ? "bg-blue-500/10 text-blue-500" :
                                                "bg-emerald-500/10 text-emerald-500"
                                            )}>
                                                {msg.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 group-hover:translate-x-[-10px] transition-transform">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteMessage(msg.id)
                                                    }}
                                                    className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center opacity-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <MessageSquare size={48} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">No Inquiries Found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detailed Mediation Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-card border border-border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-10 border-b border-border bg-muted/20 flex flex-col gap-6 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <MessageSquare size={120} />
                                </div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 flex items-center justify-center text-primary-foreground">
                                            <User size={28} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-black  tracking-tighter uppercase leading-none">{selectedMessage.name}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 ">{selectedMessage.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Subject Line</span>
                                    <h2 className="text-2xl font-black  uppercase tracking-tighter leading-tight text-foreground">
                                        {selectedMessage.subject}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-10 flex-1 overflow-y-auto max-h-[400px] flex flex-col gap-10">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <CornerUpRight size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Message Content</span>
                                    </div>
                                    <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 text-[11px] font-bold text-foreground leading-relaxed uppercase ">
                                        "{selectedMessage.message}"
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1 p-5 rounded-2xl bg-muted/20 border border-border/50">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original Timestamp</span>
                                        <span className="text-xs font-bold text-foreground">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-5 rounded-2xl bg-muted/20 border border-border/50">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current Status</span>
                                        <Badge className="w-fit mt-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedMessage.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-8 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <Button 
                                        onClick={() => setSelectedMessage(null)}
                                        variant="outline" 
                                        className="rounded-xl h-12 text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-border border transition-all hover:bg-primary/5"
                                    >
                                        <X size={14} /> Close
                                    </Button>
                                    {selectedMessage.status === "UNREAD" ? (
                                        <Button 
                                            onClick={() => handleUpdateStatus(selectedMessage.id, "READ")}
                                            className="rounded-xl h-12 text-[10px] font-black uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl"
                                        >
                                            <CheckCircle2 size={14} /> Mark as Read
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleUpdateStatus(selectedMessage.id, "UNREAD")}
                                            className="rounded-xl h-12 text-[10px] font-black uppercase tracking-widest gap-2 bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-xl"
                                        >
                                            <AlertCircle size={14} /> Mark as Unread
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
