"use client"

import React, { useState } from "react"
import { MessageCircle, MapPin, Clock, Phone, Mail } from "lucide-react"
import { toast } from "react-hot-toast"

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSendMessage = async (openWhatsApp: boolean) => {
        if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error("Please fill in all fields (Name, Email, Phone, and Message)")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        setIsSubmitting(true)
        const toastId = toast.loading(
            openWhatsApp 
                ? "Sending message & preparing WhatsApp..." 
                : "Transmitting inquiry to paddock dispatch..."
        )
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    subject: `Contact Inquiry from ${formData.name}`
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to send message")
            }

            if (openWhatsApp) {
                toast.success("Message logged & WhatsApp opened!", { id: toastId })
                const waText = encodeURIComponent(
                    `Hello F1GEAR KE, I would like to make an inquiry:\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nMessage: ${formData.message}`
                )
                window.open(`https://wa.me/254142656105?text=${waText}`, '_blank')
            } else {
                toast.success("Message sent! Confirmation email dispatched.", { id: toastId })
            }

            // Reset form
            setFormData({ name: "", email: "", phone: "", message: "" })
        } catch (error: any) {
            toast.error(error.message || "Failed to submit. Please try again.", { id: toastId })
            if (openWhatsApp) {
                const waText = encodeURIComponent(
                    `Hello F1GEAR KE, I would like to make an inquiry:\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nMessage: ${formData.message}`
                )
                window.open(`https://wa.me/254142656105?text=${waText}`, '_blank')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#0d0d0d] min-h-screen py-20 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-16">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e31e24] inline-block" />
                        TALK TO THE TEAM
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
                        STRAIGHT TO THE{" "}
                        <span className="text-[#e31e24]">POINT</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Left: Contact Info */}
                    <div className="flex flex-col gap-10">
                        <p className="text-[14px] text-white/40 leading-relaxed max-w-sm">
                            Questions on specs, delivery fees or availability? Message us on WhatsApp — we'll sort your order, payment and delivery.
                        </p>

                        {/* Primary CTA */}
                        <a
                            href="https://wa.me/254142656105"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#e31e24] text-white text-[11px] font-black uppercase tracking-[0.2em] px-6 h-12 w-fit hover:bg-[#c01919] transition-colors"
                        >
                            <WhatsAppIcon />
                            CHAT ON WHATSAPP
                        </a>

                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-px bg-white/5">
                            {[
                                { label: "WHATSAPP", value: "+254 142 656 105", sub: "Fastest way to order", Icon: MessageCircle },
                                { label: "M-PESA", value: "DETAILS ON WHATSAPP", sub: "Payment on confirmation", Icon: Phone },
                                { label: "LOCATION", value: "NAIROBI, KENYA", sub: "Collection by arrangement", Icon: MapPin, accent: true },
                                { label: "HOURS", value: "MON – SAT", sub: "8:00AM – 8:00PM", Icon: Clock },
                            ].map(({ label, value, sub, Icon, accent }) => (
                                <div key={label} className="bg-[#111] p-6 flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-1.5">
                                        <Icon size={10} className="text-white/20" />
                                        {label}
                                    </span>
                                    <span className={`text-[13px] font-black uppercase leading-tight ${accent ? "text-[#e31e24]" : "text-white"}`}>
                                        {value}
                                    </span>
                                    <span className="text-[11px] text-white/30 leading-relaxed">{sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-black uppercase tracking-tight text-white font-f1">SEND A MESSAGE</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(false); }} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 font-f1">FULL NAME *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Kamau"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-11 bg-white/5 border border-white/10 px-4 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#e31e24]/60 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 font-f1">EMAIL ADDRESS *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. name@domain.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-11 bg-white/5 border border-white/10 px-4 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#e31e24]/60 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 font-f1">PHONE / WHATSAPP *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="07XX XXX XXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-11 bg-white/5 border border-white/10 px-4 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#e31e24]/60 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 font-f1">MESSAGE *</label>
                                <textarea
                                    required
                                    placeholder="Tell us what you're looking for or your sizing question..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={5}
                                    className="bg-white/5 border border-white/10 px-4 py-3 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#e31e24]/60 transition-colors resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-f1">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleSendMessage(false)}
                                    className="w-full bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-[0.18em] h-13 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-lg py-3.5"
                                >
                                    <Mail size={15} className="text-[#e10600]" />
                                    <span>{isSubmitting ? "SENDING..." : "CONTACT US"}</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleSendMessage(true)}
                                    className="w-full bg-[#e10600] hover:bg-[#c90500] text-white text-xs font-black uppercase tracking-[0.18em] h-13 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xl py-3.5"
                                >
                                    <WhatsAppIcon />
                                    <span>{isSubmitting ? "TRANSMITTING..." : "CHAT ON WHATSAPP"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
