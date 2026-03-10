"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Smartphone, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ShieldCheck, Truck, RefreshCw, CreditCard } from "lucide-react"
import { toast } from "react-hot-toast"

export const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState("")

    const handleSubscribe = () => {
        if (!email) return toast.error("Please enter an email address")
        if (!email.includes("@")) return toast.error("Invalid email protocol")

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

    const footerSections = [
        {
            title: "Products",
            links: [
                { name: "iPhone Series", href: "/products?brand=apple" },
                { name: "Galaxy Series", href: "/products?brand=samsung" },
                { name: "Xiaomi Phones", href: "/products?brand=xiaomi" },
                { name: "Refurbished Deals", href: "/products?condition=refurbished" },
                { name: "Accessories", href: "/accessories" },
            ],
        },
        {
            title: "Support",
            links: [
                { name: "Track Order", href: "/track-order" },
                { name: "Partnership Program", href: "/partners" },
                { name: "Warranty Policy", href: "/support/warranty" },
                { name: "Help Center", href: "/support" },
                { name: "Corporate Sales", href: "/corporate" },
            ],
        },
        {
            title: "Company",
            links: [
                { name: "About Us", href: "/about" },
                { name: "Our Stores", href: "/stores" },
                { name: "Careers", href: "/careers" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
            ],
        },
    ]

    const trustBadges = [
        { icon: <ShieldCheck className="w-5 h-5 text-primary" />, title: "Secure Payments", desc: "PCI compliant encryption" },
        { icon: <Truck className="w-5 h-5 text-primary" />, title: "Free Shipping", desc: "On orders over $500" },
        { icon: <RefreshCw className="w-5 h-5 text-primary" />, title: "Easy Returns", desc: "14-day hassle-free returns" },
        { icon: <CreditCard className="w-5 h-5 text-primary" />, title: "Flexible EMI", desc: "Up to 12 months plans" },
    ]

    return (
        <footer className="bg-muted pt-16 pb-8 px-6 md:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto">
                {/* Trust Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-border/50">
                    {trustBadges.map((badge, idx) => (
                        <div key={idx} className="flex flex-col gap-2 items-center text-center">
                            <div className="p-3 bg-background rounded-full shadow-sm">
                                {badge.icon}
                            </div>
                            <h4 className="font-semibold text-sm">{badge.title}</h4>
                            <p className="text-xs text-muted-foreground">{badge.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 py-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-foreground">
                                Smart<span className="text-primary italic">Hub</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                            Elevating your digital lifestyle with the world's most innovative smartphones. From latest flagships to certified refurbished gems, SmartHub is your trusted tech partner.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Nairobi, Kenya • 123 Tech Avenue</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+254 700 000 000</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>contact@smarthub.io</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-4">
                            <h4 className="font-bold text-sm uppercase tracking-wider">{section.title}</h4>
                            <ul className="flex flex-col gap-2">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter Column */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Join the Hub</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Subscribe for exclusive deals, tech news, and early access to flagships.
                        </p>
                        <div className="flex flex-col gap-2 mt-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="bg-background border border-border px-4 py-2.5 rounded-lg text-sm outline-none focus:border-primary transition-colors uppercase tracking-widest font-bold placeholder:text-[10px]"
                            />
                            <button
                                onClick={handleSubscribe}
                                className="bg-primary text-white py-2.5 rounded-lg text-[10px] uppercase tracking-widest font-black hover:bg-primary/90 transition-all hover:scale-[1.01]"
                            >
                                Subscribe
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <Link href="https://facebook.com/smarthub" target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="https://twitter.com/smarthub" target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="https://instagram.com/smarthub" target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="https://youtube.com/smarthub" target="_blank" className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="w-5 h-5" /></Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} SmartHub Electronics Ltd. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {/* Payment Logos Placeholder */}
                        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                            <span className="text-[10px] font-bold border px-1 rounded flex items-center justify-center h-5 w-10">Stripe</span>
                            <span className="text-[10px] font-bold border px-1 rounded flex items-center justify-center h-5 w-10">M-PESA</span>
                            <span className="text-[10px] font-bold border px-1 rounded flex items-center justify-center h-5 w-10">VISA</span>
                            <span className="text-[10px] font-bold border px-1 rounded flex items-center justify-center h-5 w-10">PAYPAL</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
