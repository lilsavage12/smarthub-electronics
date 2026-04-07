"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Smartphone, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, Globe } from "lucide-react"
import { toast } from "react-hot-toast"

const WhatsAppIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

const TikTokIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V15.5c0 1.93-.53 3.81-1.62 5.34-1.29 1.83-3.41 2.97-5.63 3.14-2.21.17-4.43-.51-6.12-1.93C3.04 20.3 1.85 18 1.87 15.65c-.01-2.24 1.09-4.47 2.87-5.83 1.6-1.24 3.65-1.85 5.67-1.74.08 1.44-.45 2.88-1.51 3.86-1.12 1.03-2.73 1.48-4.22 1.25-.01.99.11 1.99.64 2.84.58.91 1.57 1.56 2.62 1.72 1.04.16 2.11-.06 3.02-.63.9-.55 1.48-1.52 1.59-2.55V.02z" />
    </svg>
)

const socialIcons: Record<string, any> = {
    facebook: <Facebook size={18} />,
    instagram: <Instagram size={18} />,
    twitter: <Twitter size={18} />,
    tiktok: <TikTokIcon size={18} />,
    whatsapp: <WhatsAppIcon size={20} />,
    phone: <Phone size={18} />,
    youtube: <Youtube size={18} />
}

export const Footer = ({ initialSettings }: { initialSettings?: any }) => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState("")
    const [settings, setSettings] = useState<any>(initialSettings || null)

    useEffect(() => {
        if (initialSettings) return // Skip if provided server-side
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

    const footerSections = Array.isArray(settings?.footerLinks)
        ? settings.footerLinks
        : (typeof settings?.footerLinks === 'string' ? JSON.parse(settings.footerLinks) : defaultFooterSections)

    return (
        <footer className="bg-muted pt-10 pb-8 px-6 md:px-12 border-t border-border" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto" suppressHydrationWarning>
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-8" suppressHydrationWarning>
                    {/* Brand Column */}
                    <div className="flex flex-col gap-6" suppressHydrationWarning>
                        <Link href="/" className="flex items-center gap-3" suppressHydrationWarning>
                            <div suppressHydrationWarning className="relative w-12 h-12 shrink-0">
                                <Image src="/favicon.png" alt="S" fill className="object-contain" />
                            </div>
                            <div suppressHydrationWarning className="flex flex-col leading-[0.75] py-2">
                                <span className="font-black text-3xl md:text-5xl tracking-tighter text-foreground ">
                                    SmartHub
                                </span>
                                <span className="font-black text-xl md:text-2xl tracking-tighter text-primary  mt-1.5 opacity-90">
                                    Electronics
                                </span>
                            </div>
                        </Link>
                        {settings?.companyDescription && (
                            <p className="text-[10px] font-bold text-muted-foreground max-w-sm leading-relaxed uppercase">
                                {settings.companyDescription}
                            </p>
                        )}

                    </div>

                    {/* Links Columns */}
                    {footerSections.map((section: any) => (
                        <div key={section.title} className="flex flex-col gap-6" suppressHydrationWarning>
                            <h4 className="font-black text-xs-fluid uppercase tracking-widest  text-primary/80">{section.title}</h4>
                            <ul className="flex flex-col gap-3" suppressHydrationWarning>
                                {section.links.map((link: any) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="relative group/footer text-xs-fluid font-bold text-muted-foreground hover:text-primary transition-all inline-block uppercase tracking-widest">
                                            {link.name}
                                            <div className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/footer:w-full" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {(() => {
                        const rawSocials = settings?.socials
                        const socialData = Array.isArray(rawSocials) || typeof rawSocials === 'object' && rawSocials !== null
                            ? rawSocials
                            : (typeof rawSocials === 'string' ? JSON.parse(rawSocials) : {})

                        const activeSocials = Object.entries(socialData)
                            .filter(([_, url]) => !!url && typeof url === 'string' && url.trim().length > 0)
                            .map(([platform, url]) => [platform, url])
                            .filter((item: any[], index: number, self: any[][]) =>
                                index === self.findIndex((t: any[]) => t[0].toLowerCase() === item[0].toLowerCase())
                            )

                        if (activeSocials.length === 0) return null;

                        return (
                            <div className="flex flex-col gap-6" suppressHydrationWarning>
                                <h4 className="font-black text-xs-fluid uppercase tracking-widest text-primary/80">Connect</h4>
                                <div className="flex flex-wrap gap-4" suppressHydrationWarning>
                                    {activeSocials.map(([platform, url]: any[]) => {
                                        const cleanPlatform = String(platform).toLowerCase()
                                        const icon = socialIcons[cleanPlatform] || <Globe size={18} />
                                        const href = cleanPlatform === 'phone' ? `tel:${url}` :
                                            cleanPlatform === 'whatsapp' ? `https://wa.me/${String(url).replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '')}` :
                                                url.startsWith('http') ? url : `https://${url}`

                                        return (
                                            <a
                                                key={platform}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-xl bg-muted-foreground/10 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300"
                                                title={platform}
                                            >
                                                {icon}
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4" suppressHydrationWarning>
                    {settings?.copyrightText && (
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                            {settings.copyrightText}
                        </p>
                    )}
                    <div className="flex items-center gap-6" suppressHydrationWarning />
                </div>
            </div>
        </footer>
    )
}
