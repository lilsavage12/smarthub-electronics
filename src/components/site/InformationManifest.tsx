import React from "react"
import { LucideIcon, ShieldCheck, Activity, Box, Sparkles, Zap, Smartphone } from "lucide-react"

interface InformationManifestProps {
    badge: string
    title: React.ReactNode
    description: string
    updatedAt: string
    icon: LucideIcon
    children: React.ReactNode
}

export const InformationManifest = ({
    badge,
    title,
    description,
    updatedAt,
    icon: Icon,
    children
}: InformationManifestProps) => {
    return (
        <main className="min-h-screen bg-background pt-32 pb-24 px-6 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-4xl mx-auto space-y-20 relative z-10">
                <div className="flex flex-col gap-6">
                    <h1 className="text-5xl md:text-8xl font-black  tracking-tighter uppercase leading-none text-foreground">
                        {title}
                    </h1>
                    
                    <p className="text-muted-foreground text-lg md:text-xl font-bold uppercase tracking-tight  opacity-70 max-w-2xl leading-tight">
                        {description}
                    </p>
                </div>

                {/* Content Narrative */}
                <div className="prose prose-invert prose-slate max-w-none">
                    <div className="text-muted-foreground leading-relaxed text-lg font-medium space-y-12 uppercase tracking-tight  opacity-90">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}
