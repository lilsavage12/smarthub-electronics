"use client"

import React from "react"
import { Toaster, toast, resolveValue, ToastBar } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
    CheckCircle2, AlertCircle, Info,
    X, AlertTriangle, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

export const ModernToaster = () => {
    return (
        <Toaster position="bottom-right" gutter={12}>
            {(t) => (
                <ToastBar toast={t} style={{ display: 'none' }}>
                    {({ icon, message }) => (
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className={cn(
                                    "relative flex items-center w-full max-w-sm pointer-events-auto",
                                    "bg-card/80 backdrop-blur-xl border border-border/50",
                                    "rounded-2xl p-4 shadow-2xl shadow-black/20 overflow-hidden group",
                                    t.visible ? "animate-in fade-in slide-in-from-bottom-5 duration-300" : "animate-out fade-out slide-out-to-top-5 duration-200"
                                )}
                            >
                                {/* Subtle Side Accent */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300",
                                    t.type === 'success' && "bg-emerald-500",
                                    t.type === 'error' && "bg-rose-500",
                                    t.type === 'loading' && "bg-primary animate-pulse",
                                    (t.type === 'blank' || !t.type) && "bg-muted-foreground/30"
                                )} />

                                {/* Icon Container */}
                                <div className={cn(
                                    "flex-shrink-0 mr-4 p-2 rounded-xl border border-border/50 bg-muted/40",
                                    t.type === 'success' && "text-emerald-500",
                                    t.type === 'error' && "text-rose-500",
                                    t.type === 'loading' && "text-primary",
                                    (t.type === 'blank' || !t.type) && "text-muted-foreground"
                                )}>
                                    {t.type === 'success' && <CheckCircle2 size={18} />}
                                    {t.type === 'error' && <AlertCircle size={18} />}
                                    {t.type === 'loading' && <Zap size={18} className="animate-spin" />}
                                    {(t.type === 'blank' || !t.type) && <Info size={18} />}
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 flex flex-col gap-0.5 truncate pr-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground italic leading-none truncate">
                                        {t.type === 'success' ? 'Protocol Success' :
                                            t.type === 'error' ? 'Security Alert' :
                                                t.type === 'loading' ? 'Processing Signal' :
                                                    'System Broadcast'}
                                    </span>
                                    <div className="text-[11px] font-bold text-muted-foreground tracking-tight leading-relaxed truncate opacity-70">
                                        {resolveValue(t.message, t)}
                                    </div>
                                </div>

                                {/* Minimal Close Button */}
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="absolute right-3 top-3 p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </ToastBar>
            )}
        </Toaster>
    )
}
