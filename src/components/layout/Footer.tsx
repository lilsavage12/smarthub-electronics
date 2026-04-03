"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Smartphone, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ShieldCheck, Truck, RefreshCw, CreditCard } from "lucide-react"
import { toast } from "react-hot-toast"

export const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState("")
    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await fetch("/api/cms/settings")
            if (res.ok) setSettings(await res.json())
        }
        fetchSettings()
    }, [])

    const handleSubscribe = () => {
        if (!email) return toast.error("Please enter an email address")
        if (!email.includes("@")) return toast.error("Invalid email address")

        toast.success("Welcome to the Hub! Check your inbox.", {
            icon: "🚀",
            style: {
                background: '#0F0F12',
                color: '#fff',
                border: '1px solid #1A1A1D',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
            }
        })
        setEmail("")
    }

    const defaultFooterSections: any[] = []

    const footerSections = settings?.footerLinks ? JSON.parse(settings.footerLinks) : defaultFooterSections

    return (
        <footer className="bg-muted pt-16 pb-12 px-6 md:px-12 border-t border-border" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto" suppressHydrationWarning>
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-12" suppressHydrationWarning>
                    {/* Brand Column */}
                    <div className="flex flex-col gap-6" suppressHydrationWarning>
                        <Link href="/" className="flex items-center gap-3" suppressHydrationWarning>
                            {settings?.logoUrl && (
                                <img src={settings.logoUrl} alt={settings.companyName || "Logo"} className="h-10 w-auto object-contain" />
                            )}
                            {settings?.showNameWithLogo !== false && settings?.companyName && (
                                <div className="flex flex-col leading-[0.75] py-2">
                                    <span className="font-black text-3xl md:text-5xl tracking-tighter text-foreground uppercase italic">
                                        {settings.companyName.split(' ')[0]}
                                    </span>
                                    {settings.companyName.split(' ').length > 1 && (
                                        <span className="font-black text-xl md:text-2xl tracking-tighter text-primary uppercase italic mt-1.5 opacity-90">
                                            {settings.companyName.split(' ').slice(1).join(' ')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                        {settings?.companyDescription && (
                            <p className="text-[10px] font-bold text-muted-foreground max-w-sm leading-relaxed uppercase">
                                {settings.companyDescription}
                            </p>
                        )}
                        <div className="flex flex-col gap-2" suppressHydrationWarning>
                            <div className="flex items-center gap-4 text-primary" suppressHydrationWarning>
                                {(() => {
                                    const socialData = typeof settings?.socials === 'string' ? JSON.parse(settings.socials) : settings?.socials || {}
                                    return Object.entries(socialData).map(([platform, url]: [string, any]) => {
                                        if (!url) return null;
                                        const Icon = {
                                            facebook: Facebook,
                                            twitter: Twitter,
                                            instagram: Instagram,
                                            youtube: Youtube,
                                            x: Twitter,
                                            threads: Instagram
                                        }[platform.toLowerCase()] || ShieldCheck;

                                        return (
                                            <a 
                                                key={platform} 
                                                href={url.startsWith('http') ? url : `https://${url}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="hover:scale-125 transition-transform"
                                                title={platform.toUpperCase()}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </a>
                                        );
                                    })
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerSections.map((section: any) => (
                        <div key={section.title} className="flex flex-col gap-6" suppressHydrationWarning>
                            <h4 className="font-black text-xs-fluid uppercase tracking-widest italic text-primary/80">{section.title}</h4>
                            <ul className="flex flex-col gap-3" suppressHydrationWarning>
                                {section.links.map((link: any) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-xs-fluid font-bold text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block uppercase tracking-widest">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" suppressHydrationWarning>
                    {settings?.copyrightText && (
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                            {settings.copyrightText}
                        </p>
                    )}
                    <div className="flex items-center gap-6" suppressHydrationWarning>
                        {/* Payment Badges Removed */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
