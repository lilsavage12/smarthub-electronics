"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Sparkles, Smartphone, ShieldCheck, Zap, User, MoreHorizontal, ChevronRight, Headphones, RefreshCw, Truck, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: "ai", text: "Welcome to the SmartHub Vault. I am your AI mobility strategist. How can I assist your tech journey today?", time: "14:20" }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        const userMsg = { role: "user", text: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        setMessages(prev => [...prev, userMsg])
        setInputValue("")
        setIsTyping(true)

        // Simulate AI thinking
        setTimeout(() => {
            setIsTyping(false)
            const aiResponse = getAiResponse(inputValue)
            setMessages(prev => [...prev, { role: "ai", text: aiResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
        }, 1500)
    }

    const getAiResponse = (input: string) => {
        const lowInput = input.toLowerCase()
        if (lowInput.includes("price") || lowInput.includes("cost")) return "Lumina ZX starts at $1199, while the Aurora Fold Pro is $1799. Would you like to check current trade-in credits?"
        if (lowInput.includes("trade") || lowInput.includes("old")) return "Our trade-in protocol can offer up to $850 for like-new iPhone 15 Pro Max models. Use our Trade-In tool for a custom estimate."
        if (lowInput.includes("delivery") || lowInput.includes("ship")) return "Express 1-hour delivery is active for Nairobi. Outer regions typically arrive within 24-48 business hours via SmartHub Logistics."
        if (lowInput.includes("warranty")) return "Every device includes 24 months of SmartWarranty protection. It covers mechanical failures and battery health degradation."
        return "Fascinating query. I've logged your request into our Hub database. Could you specify if you're interested in flagships, corporate bulk orders, or trade-in credits?"
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-[60] h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 overflow-hidden group",
                    isOpen ? "bg-foreground border-foreground rotate-90" : "bg-primary border-primary hover:scale-110 active:scale-95"
                )}
                whileHover={{ rotate: isOpen ? 90 : 12 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <X className="w-8 h-8 text-background" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <MessageSquare className="w-8 h-8 text-white fill-white/20" />
                            <div className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-primary animate-ping" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Windows UI */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8, rotate: 2 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8, rotate: -2 }}
                        className="fixed bottom-24 right-6 z-[60] w-[380px] h-[600px] bg-background border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden flex flex-col backdrop-blur-3xl"
                    >
                        {/* Header Header */}
                        <div className="p-8 bg-primary/10 border-b border-border/30 relative">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center p-2.5 shadow-xl shadow-primary/20">
                                    <Zap className="w-full h-full text-white fill-white/20" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-black font-outfit uppercase tracking-tighter italic leading-none">SmartHub <span className="text-primary italic">AI</span></h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sync Active • High Priority</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground hover:rotate-90 transition-all p-2 bg-muted/50 rounded-full">
                                    <ChevronRight className="w-5 h-5 rotate-90" />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-1" />
                        </div>

                        {/* Message Stream Stream */}
                        <div
                            ref={scrollRef}
                            className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col gap-6 bg-gradient-to-b from-transparent to-muted/10"
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20, y: 10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    className={cn(
                                        "flex flex-col max-w-[85%] gap-2",
                                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-foreground text-background rounded-tr-none font-bold uppercase tracking-wide text-xs px-6 py-4"
                                                : "bg-muted border border-border/50 text-foreground rounded-tl-none border-l-4 border-l-primary"
                                        )}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-2 flex items-center gap-1">
                                        {msg.role === 'user' ? <User className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5 text-primary" />}
                                        {msg.time}
                                    </span>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-5 bg-muted rounded-[2rem] rounded-tl-none w-24 border border-border/50">
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                                </motion.div>
                            )}
                        </div>

                        {/* Quick Actions Actions */}
                        <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-muted/20 border-t border-border/20">
                            {[
                                { label: "Trade-In", icon: <RefreshCw className="w-3 h-3" /> },
                                { label: "Check Shipping", icon: <Truck className="w-3 h-3" /> },
                                { label: "Pricing", icon: <Zap className="w-3 h-3" /> },
                                { label: "Corporate", icon: <Building className="w-3 h-3" /> }
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInputValue(action.label)}
                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Message Entry Protocol */}
                        <form
                            onSubmit={handleSend}
                            className="p-6 bg-background pt-2 mb-2"
                        >
                            <div className="relative group">
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="INITIATE SYNC..."
                                    className="w-full bg-muted border border-transparent rounded-[2rem] pl-6 pr-14 py-5 text-xs font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-inner"
                                />
                                <button
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 top-2 bottom-2 w-12 bg-primary text-white rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-xl shadow-primary/20"
                                >
                                    <Send className="w-5 h-5 fill-white/20" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-4 px-2">
                                <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <Headphones className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Live Human Agent on Standby</span>
                                </div>
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-30" />
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
