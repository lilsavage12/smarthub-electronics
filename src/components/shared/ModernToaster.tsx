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
        <Toaster 
            position="bottom-right" 
            gutter={12}
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'rgba(15, 15, 18, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#F43F5E',
                        secondary: '#fff',
                    },
                },
            }}
        />
    )
}
