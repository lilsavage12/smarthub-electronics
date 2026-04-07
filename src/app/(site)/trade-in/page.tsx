"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Smartphone, Zap, ShieldCheck, CheckCircle2, ChevronRight,
    Search, Cpu, Battery, Info, AlertCircle, RefreshCw, Star, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function TradeInPage() {
    const [step, setStep] = useState(1) // 1: Select Model, 2: Condition, 3: Estimate
    const [selectedBrand, setSelectedBrand] = useState("Apple")
    const [selectedModel, setSelectedModel] = useState("iPhone 15 Pro Max")
    const [condition, setCondition] = useState("Like New")

    const estimates: any = {
        "Like New": 850,
        "Good": 650,
        "Cracked": 300,
        "Non-Functional": 100
    }

    const handleNextStep = () => {
        if (step < 3) setStep(step + 1)
    }

    const resetTradeIn = () => {
        setStep(1)
        setCondition("Like New")
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12 mt-[80px]">
            <div className="text-center flex flex-col items-center gap-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Device Trade-In</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter  leading-none">Turn Old Tech <br /><span className="text-primary ">Into New Credit</span></h1>
                <p className="text-xl text-muted-foreground leading-relaxed">Upgrade to the latest flagship with ease. Simply tell us about your current device and get instant credit towards your next purchase.</p>
            </div>

            <div className="max-w-4xl mx-auto w-full">
                {/* Progress Tracker */}
                <div className="flex items-center justify-between mb-12 px-12">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4 relative">
                            <div className={cn(
                                "h-12 w-12 rounded-full border-2 flex items-center justify-center font-black transition-all",
                                step >= s ? "bg-primary border-primary text-white shadow-xl scale-110" : "bg-muted border-border text-muted-foreground"
                            )}>
                                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                            </div>
                            <span className={cn("text-xs font-bold uppercase tracking-widest hidden md:block", step >= s ? "text-foreground" : "text-muted-foreground")}>
                                {s === 1 ? "Select Model" : s === 2 ? "Condition" : "Estimate"}
                            </span>
                            {s < 3 && <div className="hidden md:block w-24 h-0.5 bg-border mx-4" />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-muted/30 border border-border/50 rounded-[3rem] p-8 md:p-12 shadow-inner backdrop-blur-md min-h-[500px] flex flex-col overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-8 h-full"
                            >
                                <div className="flex flex-col gap-3">
                                    <h2 className="text-3xl font-black font-outfit uppercase  tracking-tighter ">Identify Your Device</h2>
                                    <p className="text-muted-foreground">Select the brand and exact model of the smartphone you wish to trade.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {["Apple", "Samsung", "Google", "Xiaomi"].map(b => (
                                        <button
                                            key={b}
                                            onClick={() => setSelectedBrand(b)}
                                            className={cn("py-4 rounded-2xl font-black border-2 transition-all uppercase tracking-widest", selectedBrand === b ? "bg-primary text-white border-primary shadow-lg" : "bg-background/50 border-border text-muted-foreground hover:border-primary/50")}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            placeholder={`Search ${selectedBrand} models...`}
                                            className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-5 text-base font-bold uppercase tracking-widest outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 14 Pro Max", "iPhone 13"].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setSelectedModel(m)}
                                                className={cn("text-left px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-between group", selectedModel === m ? "bg-primary/10 text-primary border-primary shadow-md" : "bg-background/20 border-transparent text-muted-foreground hover:bg-background/50")}
                                            >
                                                <span className="font-bold  uppercase">{m}</span>
                                                <ChevronRight className={cn("w-4 h-4 transition-transform", selectedModel === m ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={handleNextStep} variant="premium" className="h-16 mt-auto rounded-2xl text-lg font-black  tracking-widest">
                                    CHECK CONDITION
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-8 h-full"
                            >
                                <div className="flex flex-col gap-3">
                                    <h2 className="text-3xl font-black font-outfit uppercase  tracking-tighter ">Device Condition</h2>
                                    <p className="text-muted-foreground">Be honest about the physical state of your device for an accurate voucher.</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {[
                                        { title: "Like New", desc: "No scratches, fully functional, battery health > 90%", icon: <Sparkles className="w-5 h-5" /> },
                                        { title: "Good", desc: "Minor light scratches, no cracks, fully functional", icon: <CheckCircle2 className="w-5 h-5" /> },
                                        { title: "Cracked", desc: "Screen or back glass cracked, functional touch", icon: <AlertCircle className="w-5 h-5" /> },
                                        { title: "Non-Functional", desc: "Major damage, won't turn on, liquid damage", icon: <RefreshCw className="w-5 h-5 text-red-500" /> }
                                    ].map(c => (
                                        <button
                                            key={c.title}
                                            onClick={() => setCondition(c.title)}
                                            className={cn("p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left group", condition === c.title ? "bg-card border-primary shadow-xl scale-[1.02]" : "bg-background/20 border-border/50 text-muted-foreground hover:border-primary/50")}
                                        >
                                            <div className={cn("p-3 rounded-2xl transition-colors", condition === c.title ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                                                {c.icon}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black uppercase  text-lg">{c.title}</span>
                                                <p className="text-xs font-bold text-muted-foreground opacity-70 uppercase tracking-wider">{c.desc}</p>
                                            </div>
                                            {condition === c.title && <div className="ml-auto text-primary px-3 py-1 rounded-full border border-primary text-[10px] font-black ">SELECTED</div>}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 mt-4">
                                    <Info className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest leading-tight">Trade-in values are subject to verification when you visit our store.</p>
                                </div>

                                <div className="flex gap-4 mt-auto">
                                    <Button onClick={() => setStep(1)} variant="outline" className="h-16 flex-1 rounded-2xl border-2 font-black  tracking-widest text-muted-foreground">BACK</Button>
                                    <Button onClick={handleNextStep} variant="premium" className="h-16 flex-[2] rounded-2xl text-lg font-black  tracking-widest">GET ESTIMATE</Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center gap-8 py-8 h-full"
                            >
                                <div className="relative">
                                    <div className="h-64 w-64 bg-primary/10 rounded-full flex flex-col items-center justify-center border-4 border-dashed border-primary/20 animate-pulse relative">
                                        <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2 ">Estimated Value</span>
                                        <span className="text-7xl font-black text-foreground font-outfit  tracking-tighter">${estimates[condition]}</span>
                                        <Zap className="absolute top-4 right-4 text-primary w-8 h-8 fill-primary" />
                                    </div>
                                    <div className="absolute inset-0 bg-primary/10 blur-[120px] -z-1" />
                                </div>

                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="flex items-center gap-3 bg-teal-500/10 px-4 py-2 rounded-xl text-teal-600 border border-teal-500/20 font-bold uppercase tracking-widest text-xs">
                                        <ShieldCheck className="w-4 h-4" />
                                        Device Value Estimated
                                    </div>
                                    <h3 className="text-3xl font-black uppercase  tracking-tighter">{selectedModel} • {condition}</h3>
                                    <p className="text-muted-foreground max-w-sm">This credit can be applied immediately toward your next purchase or saved for later.</p>
                                </div>

                                <div className="flex flex-col gap-4 w-full mt-4">
                                    <Button variant="premium" className="h-20 text-xl font-black  tracking-widest rounded-[2rem] shadow-2xl">APPLY CREDIT AT CHECKOUT</Button>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={resetTradeIn} className="h-14 flex-1 rounded-2xl border-2 font-black uppercase tracking-widest text-xs">Start New</Button>
                                        <Button variant="outline" className="h-14 flex-1 rounded-2xl border-2 font-black uppercase tracking-widest text-xs">Download Report (PDF)</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* FAQ Section */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-3xl font-black font-outfit  uppercase tracking-tighter">Why Trade-In?</h2>
                        <ul className="flex flex-col gap-6">
                            {[
                                { icon: <Zap />, title: "Instant Credit", text: "No waiting for shipping or bank transfers. Apply it immediately." },
                                { icon: <ShieldCheck />, title: "Secure Deletion", text: "We guarantee 100% data wiping with certified software." },
                                { icon: <RefreshCw />, title: "Eco Friendly", text: "Join our circular economy and reduce e-waste worldwide." }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 items-start">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">{item.icon}</div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold uppercase  text-sm">{item.title}</span>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-background border border-border rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
                        <h3 className="font-black  uppercase tracking-tighter text-xl">Recent Estimates</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { name: "iPhone 14 Pro", val: "$540", time: "2m ago" },
                                { name: "Galaxy S23 Ultra", val: "$480", time: "5m ago" },
                                { name: "Pixel 8 Pro", val: "$420", time: "12m ago" }
                            ].map((ev, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase">{ev.name}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{ev.time}</span>
                                    </div>
                                    <span className="text-sm font-black text-primary">{ev.val}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-[10px] font-bold text-muted-foreground uppercase text-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            AVERAGE USER SAVES $400 VIA SMART-TRADE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
