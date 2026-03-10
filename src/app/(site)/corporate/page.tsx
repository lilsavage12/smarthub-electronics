"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Building, Briefcase, Zap, ShieldCheck, Truck, Users, Globe, BarChart3,
    Mail, Phone, ChevronRight, FileText, CheckCircle2, Star, Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CorporatePage() {
    const [formSubmitted, setFormSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormSubmitted(true)
    }

    return (
        <div className="flex flex-col gap-24 mt-[80px] overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-[65vh] flex items-center justify-center p-6 lg:p-12 bg-background overflow-hidden border-b border-border">
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-80" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[200px] rounded-full -z-1" />

                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-3 bg-muted border border-border px-4 py-1.5 rounded-full w-fit mb-8 backdrop-blur-md">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Enterprise Solutions</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic leading-[1.1] text-foreground">
                            Powering <br />
                            <span className="text-primary italic">Digital Mobility</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mt-6">
                            Empower your workforce with the world's most advanced smartphones. Seamless procurement, volume discounts, and dedicated enterprise support.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-10">
                            <button className="bg-primary text-primary-foreground h-16 px-10 rounded-2xl font-black italic tracking-widest text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest">PROCURE DEVICES</button>
                            <button className="bg-muted text-foreground border border-border h-16 px-10 rounded-2xl font-black italic uppercase tracking-widest hover:bg-muted/80 transition-all font-outfit">TALK TO EXPERT</button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:flex items-center justify-center">
                        <div className="relative w-full aspect-square bg-card rounded-[4rem] border border-border p-12 overflow-hidden flex items-center justify-center shadow-3xl">
                            <div className="flex flex-col gap-6 text-center">
                                <Users className="w-24 h-24 text-primary mx-auto mb-4" />
                                <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white">10,000+</h3>
                                <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Active Corporate Users Across East Africa</span>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                <p className="text-xs text-white/80 italic font-bold">"SmartHub transformed our fleet management. Their volume pricing is unmatched in the region."</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2">— Tech Corp Holdings</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Corporate Value Pillars */}
            <section className="px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12">
                {[
                    { icon: <BarChart3 className="w-8 h-8" />, title: "Volume Discounts", text: "Save up to 25% on bulk purchases of flagships and accessories." },
                    { icon: <ShieldCheck className="w-8 h-8" />, title: "MDM Integration", text: "Pre-configured and ready to integrate with your existing MDM protocols." },
                    { icon: <Truck className="w-8 h-8" />, title: "Priority Logistics", text: "Dedicated shipping lanes and expedited customs clearance for global hubs." },
                    { icon: <Briefcase className="w-8 h-8" />, title: "Business Credit", text: "Flexible 30/60/90 day payment cycles according to corporate policies." }
                ].map((pill, i) => (
                    <motion.div key={i} whileHover={{ y: -8 }} className="flex flex-col gap-4 p-8 bg-muted border border-border rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all h-full">
                        <div className="bg-primary/10 p-4 rounded-3xl w-fit text-primary">{pill.icon}</div>
                        <h4 className="text-xl font-black font-outfit italic tracking-tighter uppercase">{pill.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-bold opacity-70">{pill.text}</p>
                    </motion.div>
                ))}
            </section>

            {/* Bulk Quote Form Area */}
            <section id="quote-form" className="px-6 py-24 bg-muted/20 border-y border-border/50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    <div className="flex flex-col gap-8">
                        <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter italic leading-none">Request An <br /><span className="text-primary italic">Enterprise Quote</span></h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">Our dedicated Corporate Managers will review your fleet requirements and generate a customized pricing proposal within 12 business hours.</p>

                        <div className="flex flex-col gap-6 mt-4">
                            {[
                                "Customized Branding Options",
                                "Bulk Device Warranty Programs",
                                "Fleet Refurbishment Buy-backs",
                                "On-Site Technical Training"
                            ].map(item => (
                                <div key={item} className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!formSubmitted ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-6 p-10 bg-background border border-border shadow-2xl rounded-[3rem] relative"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Company Primary</label>
                                        <input required placeholder="EX: TECH INDUSTRIES" className="bg-muted border border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-sm uppercase font-black" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Authorized Contact</label>
                                        <input required placeholder="YOUR NAME" className="bg-muted border border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-sm uppercase font-black" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Business Protocol (Email)</label>
                                        <input required type="email" placeholder="PROTO@CORP.IO" className="bg-muted border border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-sm uppercase font-black" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Approx Fleet Size</label>
                                        <select className="bg-muted border border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-sm uppercase font-black appearance-none">
                                            <option>10 - 50 DEVICES</option>
                                            <option>50 - 200 DEVICES</option>
                                            <option>200 - 1,000 DEVICES</option>
                                            <option>1,000+ DEVICES</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Request Scope (Models, Software, etc.)</label>
                                    <textarea placeholder="Tell us about your technical requirements..." className="bg-muted border border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-sm uppercase font-black min-h-[120px]" />
                                </div>
                                <Button variant="premium" className="h-20 text-xl font-black italic tracking-widest rounded-3xl shadow-xl uppercase mt-4">
                                    GET CUSTOMIZED PRICE
                                    <ChevronRight className="ml-2 w-6 h-6" />
                                </Button>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold text-center mt-2 px-12">By submitting you agree to our corporate privacy standards and data protection protocols.</p>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center gap-8 py-20 bg-primary/5 rounded-[4rem] border border-primary/20"
                            >
                                <div className="h-24 w-24 bg-primary rounded-full flex items-center justify-center p-6 shadow-2xl">
                                    <CheckCircle2 className="w-full h-full text-white" />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-3xl font-black font-outfit uppercase italic tracking-tighter">Transmission Successful</h3>
                                    <p className="text-muted-foreground max-w-sm px-8">Our Enterprise Hub has received your request. A dedicated Account Strategist will reach out via email shortly.</p>
                                </div>
                                <Button variant="outline" onClick={() => setFormSubmitted(false)} className="rounded-xl border-2 uppercase font-black tracking-widest text-xs px-12 py-6">Reset Form Status</Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Global Presence */}
            <section className="px-6 pb-24 max-w-7xl mx-auto w-full flex flex-col items-center text-center gap-12">
                <div className="flex flex-col gap-2">
                    <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">SmartHub Global Operations</span>
                    <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter italic italic">Serving Enterprise Hubs <br />Across East Africa</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                    {["Nairobi", "Mombasa", "Kigali", "Kampala", "Dar Es Salaam"].map(loc => (
                        <div key={loc} className="flex flex-col items-center gap-3">
                            <Globe className="w-10 h-10 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest italic font-black">{loc}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer CTA */}
            <section className="px-6 py-24 bg-foreground rounded-[4rem] text-background mx-6 mb-12 flex flex-col items-center text-center gap-8 overflow-hidden relative shadow-3xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/30 to-transparent -z-1 opacity-50" />
                <h2 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter italic">Ready For <br /><span className="text-primary italic">Digital Superiority?</span></h2>
                <p className="text-xl text-background/60 max-w-2xl leading-relaxed font-medium uppercase tracking-widest">Setup your corporate account in under 5 minutes and unlock immediate volume pricing on all latest smartphone releases.</p>
                <div className="flex flex-wrap items-center gap-6 mt-6">
                    <Button variant="premium" className="h-16 px-12 rounded-2xl text-lg font-black italic tracking-widest">SETUP ACCOUNT</Button>
                    <Button variant="outline" className="h-16 px-12 rounded-2xl text-lg font-black italic border-background/20 text-background hover:bg-background/10 transition-all">VIEW FLEET PACKS</Button>
                </div>
                <div className="flex items-center gap-6 mt-12 opacity-30">
                    <Smartphone className="w-8 h-8" />
                    <div className="h-1 w-24 bg-background/20 rounded-full" />
                    <Building className="w-8 h-8" />
                    <div className="h-1 w-24 bg-background/20 rounded-full" />
                    <Globe className="w-8 h-8" />
                </div>
            </section>
        </div>
    )
}
