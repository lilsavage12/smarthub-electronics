import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const SkeletonLoader = ({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) => {
  return (
    <div className={cn(
      "grid gap-6 w-full",
      viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
    )}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={cn(
          "bg-card border border-border rounded-3xl overflow-hidden relative group",
          viewMode === "list" ? "flex flex-row h-32 items-center" : "flex flex-col h-[400px]"
        )}>
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          
          <div className={cn(
            "bg-muted/50",
            viewMode === "list" ? "w-32 h-full" : "aspect-square w-full"
          )} />
          
          <div className="p-4 flex flex-1 flex-col gap-4">
            <div className="h-2 w-1/3 bg-muted/60 rounded-full" />
            <div className="h-4 w-3/4 bg-muted rounded-full" />
            <div className="mt-auto flex justify-between items-center">
              <div className="h-6 w-20 bg-muted rounded-full" />
              <div className="h-10 w-10 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
