import React from "react"
import { ShieldCheck, Wrench, Activity, ChevronRight, Headphones, Settings, Clock, Zap, Phone, Mail, MapPin } from "lucide-react"
import { ContentLayout } from "@/components/site/ContentLayout"
import Link from "next/link"

export const metadata = {
    title: "Support Center | SmartHub Electronics",
    description: "Official hardware diagnostics and support services."
}

export default function ServiceCenterPage() {
    return (
        <ContentLayout 
            badge="Support Center" 
            title={<>HARDWARE <span className='text-primary italic'>SUPPORT</span></>} 
            description="Official support and maintenance services for your SmartHub products."
            updatedAt="Always Available"
            icon={Wrench}
        >
            <section className="flex flex-col gap-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-12 rounded-[3.5rem] bg-primary/5 border border-primary/20 flex flex-col gap-8 shadow-2xl group hover:border-primary/40 transition-all">
                        <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Diagnostic Check</h2>
                            <p className="text-md font-bold uppercase tracking-tight italic opacity-70 leading-tight">
                                Run a comprehensive system check on your device. Our automated tools identify performance bottlenecks and software inconsistencies instantly.
                            </p>
                        </div>
                        <button className="w-fit flex items-center gap-2 text-primary font-black uppercase italic tracking-widest text-sm bg-primary/10 px-8 py-4 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                            Start Check <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="p-12 rounded-[3.5rem] bg-muted/20 border border-border flex flex-col gap-8 shadow-2xl group hover:border-primary/30 transition-all">
                        <div className="w-16 h-16 rounded-[2rem] bg-muted/10 flex items-center justify-center text-muted-foreground mb-2">
                            <Clock size={32} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Repair History</h2>
                            <p className="text-md font-bold uppercase tracking-tight italic opacity-70 leading-tight">
                                Access your collection's service history and active maintenance tickets. Track the journey of your devices through our evaluation network.
                            </p>
                        </div>
                        <Link href="/orders" className="w-fit flex items-center gap-2 text-foreground font-black uppercase italic tracking-widest text-sm bg-muted/30 px-8 py-4 rounded-full group-hover:bg-foreground group-hover:text-background transition-all">
                            View Records <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-10">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Technical Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Phone Support", icon: Headphones, sub: "Direct support line with our senior technicians for instant troubleshooting." },
                            { label: "Hardware Repair", icon: Wrench, sub: "Professional repair services for screens, batteries, and internal components." },
                            { label: "Software Updates", icon: Settings, sub: "Professional management of software and system updates for your devices." }
                        ].map((card, i) => (
                            <div key={i} className="p-10 rounded-[3rem] bg-muted/20 border border-border flex flex-col gap-6 hover:border-primary/30 transition-all">
                                <card.icon size={28} className="text-primary" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-black italic uppercase tracking-widest">{card.label}</span>
                                    <p className="text-[12px] font-bold opacity-50 tracking-tight leading-tight uppercase italic">{card.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-muted/10 p-12 rounded-[4rem] border border-border flex flex-col md:flex-row items-center gap-12 text-center md:text-left shadow-xl">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Activity size={48} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">Service Network</h3>
                        <p className="text-md font-bold uppercase tracking-tight italic opacity-60 leading-tight max-w-2xl">
                            Our support team is currently active and ready to help. Your information is safe with us. Average response time is currently under 12 hours.
                        </p>
                    </div>
                    <Link href="/contact" className="ml-auto w-full md:w-auto px-12 py-5 bg-foreground text-background font-black italic uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">
                        Contact Expert
                    </Link>
                </div>
            </section>
        </ContentLayout>
    )
}
