"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
    Mail, Phone, MapPin, Send,
    Clock, CheckCircle2, ShieldCheck,
    Globe, Twitter, Instagram, Facebook,
    AlertCircle, MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    })

    const [settings, setSettings] = useState({
        address: "123 Logistics Plaza, Tech City, 90210",
        email: "support@smarthub.nexus",
        phone: "+1 (888) HUB-SMART",
        hours: "MON – SAT: 9 AM – 7 PM\nSUN: SYSTEM OFFLINE"
    })

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings/store")
                if (res.ok) {
                    const data = await res.json()
                    setSettings(data)
                }
            } catch (error) {
                console.error("Failed to fetch store settings:", error)
            }
        }
        fetchSettings()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
            toast.error("Please fill in all required fields")
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid email address")
            return
        }

        setIsSubmitting(true)
        const toastId = toast.loading("Sending message to support...")

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Message successfully sent. Our support team will respond shortly.", { id: toastId })
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
            } else {
                const error = await res.json()
                throw new Error(error.error || "Failed to send message")
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

                {/* Left Section: Contact Information */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-12"
                >
                    <div className="flex flex-col gap-6">
                        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] leading-none">Customer Relations</span>
                        <h1 className="text-5xl lg:text-7xl font-black  tracking-tighter uppercase leading-[0.85] text-foreground">
                            Do you have <br />
                            <span className="text-primary">some questions?</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-md">
                            We&apos;ll get back to you as soon as possible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center text-center gap-4 p-8 rounded-[2rem] bg-muted/30 border border-border/50 hover:border-primary/20 transition-all group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <MapPin size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Store Location</span>
                                <p className="text-xs font-bold text-foreground line-clamp-2">{settings.address}</p>
                            </div>
                        </a>

                        <a
                            href={`mailto:${settings.email}`}
                            className="flex flex-col items-center text-center gap-4 p-8 rounded-[2rem] bg-muted/30 border border-border/50 hover:border-primary/20 transition-all group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Support</span>
                                <p className="text-xs font-bold text-foreground ">{settings.email}</p>
                            </div>
                        </a>

                        <a
                            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                            className="flex flex-col items-center text-center gap-4 p-8 rounded-[2rem] bg-muted/30 border border-border/50 hover:border-primary/20 transition-all group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Phone size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Hotline</span>
                                <p className="text-xs font-bold text-foreground">{settings.phone}</p>
                            </div>
                        </a>

                        <div className="flex flex-col items-center text-center gap-4 p-8 rounded-[2rem] bg-muted/30 border border-border/50 hover:border-primary/20 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Clock size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Hours</span>
                                <div className="text-[10px] font-bold text-foreground space-y-1 whitespace-pre-line">
                                    {settings.hours}
                                </div>
                            </div>
                        </div>
                    </div>


                </motion.div>

                {/* Right Section: Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-x-12 translate-y-12 -z-10" />

                    <div className="p-10 lg:p-16 rounded-[3.5rem] bg-card border border-border shadow-2xl flex flex-col gap-10">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <MessageSquare size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Message Support</span>
                            </div>
                            <h2 className="text-3xl font-black  tracking-tighter uppercase leading-none">Send a Message</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="E.G. ALEX DRIVER"
                                        className="h-14 rounded-2xl bg-muted/50 border-border/50 text-xs font-bold uppercase placeholder:text-muted-foreground/30 px-6 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="SUPPORT@SMARTHUB.ELECTRONICS"
                                        className="h-14 rounded-2xl bg-muted/50 border-border/50 text-xs font-bold uppercase placeholder:text-muted-foreground/30 px-6 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Phone Number</label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+254 7XX XXX XXX"
                                    className="h-14 rounded-2xl bg-muted/50 border-border/50 text-xs font-bold uppercase placeholder:text-muted-foreground/30 px-6 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Subject</label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="TECHNICAL SUPPORT / SALES OVERVIEW"
                                    className="h-14 rounded-2xl bg-muted/50 border-border/50 text-xs font-bold uppercase placeholder:text-muted-foreground/30 px-6 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Message</label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="ENTER YOUR MESSAGE OR QUESTIONS..."
                                    className="min-h-[200px] rounded-3xl bg-muted/50 border-border/50 p-6 text-xs font-bold uppercase placeholder:text-muted-foreground/30 focus:ring-primary/20 resize-none leading-relaxed"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-16 rounded-2xl bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 font-black  uppercase tracking-widest text-xs group"
                            >
                                <span className="flex items-center gap-3">
                                    {isSubmitting ? (
                                        <Clock className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            Send Message
                                            <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </span>
                            </Button>
                        </form>

                        <div className="flex items-center justify-between pt-6 border-t border-border opacity-30 mt-4">
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
