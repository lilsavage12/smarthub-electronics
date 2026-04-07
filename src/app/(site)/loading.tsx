"use client"

import React from "react"
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
            <div className="relative">
                {/* Subtle visual glow for depth */}
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse scale-150" />

                {/* Minimal Loading Circle */}
                <Loader2
                    className="relative w-10 h-10 text-primary animate-spin"
                    strokeWidth={2.5}
                />
            </div>
        </div>
    )
}
