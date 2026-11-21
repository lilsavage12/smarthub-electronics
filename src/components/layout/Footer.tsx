"use client"

import React from "react"
import Link from "next/link"

export const Footer = ({ initialSettings }: { initialSettings?: any }) => {
    return (
        <footer className="bg-[#09090b] border-t border-white/5 py-7 px-6 md:px-12 text-white/50">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
                {/* Ultra-compact flex grouping */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12">

                    {/* Logo & short tagline on the left */}
                    <div className="flex flex-col items-start gap-1 max-w-xs">
                        <Link href="/" className="inline-flex items-center tracking-tighter">
                            <span className="font-black text-white text-xl tracking-tighter font-f1">F1GEAR</span>
                            <span className="text-[#e10600] font-black text-xl mx-1.5 leading-none">|</span>
                            <span className="text-white/60 font-bold text-xs tracking-[0.2em] uppercase mt-0.5">KE</span>
                        </Link>
                        <p className="text-[11px] text-white/40 leading-tight">
                            Formula One inspired streetwear, designed for the paddock and the street.
                        </p>
                    </div>

                    {/* Sections Grouped Closely */}
                    <div className="flex flex-wrap gap-10 md:gap-16">
                        {/* Shop Navigation */}
                        <div className="flex flex-col gap-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 font-f1">SHOP</h4>
                            <ul className="flex flex-col space-y-1 text-[11px] font-medium leading-tight list-none p-0 m-0">
                                <li><Link href="/products" className="hover:text-white transition-colors block">All gear</Link></li>
                                <li><Link href="/shipping-and-return-policy" className="hover:text-white transition-colors block">Delivery & payment</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors block">Contact</Link></li>
                                <li><Link href="/checkout" className="hover:text-white transition-colors block">Checkout</Link></li>
                            </ul>
                        </div>

                        {/* Reach Us */}
                        <div className="flex flex-col gap-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 font-f1">REACH US</h4>
                            <ul className="flex flex-col space-y-1 text-[11px] font-medium leading-tight list-none p-0 m-0">
                                <li className="block">WhatsApp · <a href="https://wa.me/254142656105" className="text-white/70 hover:text-white transition-colors">0142 656 105</a></li>
                                <li className="block">M-Pesa · details on WhatsApp</li>
                                <li className="block">Nairobi, Kenya · Mon – Sat: 8:00am – 8:00pm</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="border-t border-white/5 pt-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-white/20">
                    <p>© 2026 f1gear.ke · Nairobi, Kenya</p>
                    <p>Prices exclusive of delivery fees</p>
                </div>
            </div>
        </footer>
    )
}
