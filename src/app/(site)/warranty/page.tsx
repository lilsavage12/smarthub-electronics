import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ContentLayout } from "@/components/site/ContentLayout"
import { ShieldCheck, Zap } from "lucide-react"

export const metadata = {
    title: "Warranty | SmartHub Electronics",
    description: "Comprehensive warranty and protection plans for your devices."
}

export default async function WarrantyPage() {
    const { data: pageData } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', 'warranty')
        .maybeSingle()

    if (pageData && pageData.status === "PUBLISHED") {
        return (
            <ContentLayout 
                badge="Warranty Policy" 
                title={pageData.title.toUpperCase()} 
                description={pageData.seoDescription || "Official warranty information."}
                updatedAt={new Date(pageData.updatedAt).toLocaleDateString()}
                icon={ShieldCheck}
            >
                <div 
                    className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg font-medium space-y-8 uppercase tracking-tight  opacity-90"
                    dangerouslySetInnerHTML={{ __html: pageData.content.replace(/\n/g, '<br />') }}
                />
            </ContentLayout>
        )
    }

    return (
        <ContentLayout 
            badge="Official Policy" 
            title={<>WARRANTY <span className='text-amber-500 '>COVERAGE</span></>} 
            description="Premium protection plans for your high-end electronics. Guaranteed quality assurance."
            updatedAt="Updated Q2 2024"
            icon={ShieldCheck}
        >
            <section className="flex flex-col gap-12">
                <div className="bg-amber-500/5 p-12 rounded-[3.5rem] border border-amber-500/20 flex flex-col gap-8 shadow-2xl">
                    <div className="flex items-center gap-4 text-amber-500">
                        <Zap size={24} />
                        <h2 className="text-3xl font-black  tracking-tighter uppercase leading-none">Standard 1-Year Warranty</h2>
                    </div>
                    <p className="text-md font-bold uppercase tracking-tight  opacity-90 leading-tight">
                        Every product purchased from SmartHub includes a 12-month standard warranty. This protects against manufacturing defects and equipment failures under standard use.
                    </p>
                </div>

                <div className="flex flex-col gap-10">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Coverage Tiers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { 
                                tier: "Standard", 
                                period: "12 Months",
                                color: "primary", 
                                features: ["Manufacturing Defects", "Battery Degradation (under 80%)", "Hardware Failures"] 
                            },
                            { 
                                tier: "Premium Protection", 
                                period: "24-36 Months",
                                color: "amber-500", 
                                features: ["Accidental Damage (1 Event/Year)", "Priority Support", "Next-Day Device Replacement"] 
                            }
                        ].map((tier, i) => (
                            <div key={i} className={`p-10 rounded-[3rem] bg-muted/20 border border-border flex flex-col gap-8 hover:border-${tier.color}/30 transition-all shadow-xl`}>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black uppercase text-primary tracking-[.4em] ">{tier.period} Coverage</span>
                                    <h3 className={`text-3xl font-black  uppercase  text-${tier.color}`}>{tier.tier} Tier</h3>
                                </div>
                                <div className="flex flex-col gap-6">
                                    {tier.features.map((f, fi) => (
                                        <div key={fi} className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                                            <span className="text-[12px] font-bold uppercase tracking-widest  opacity-70">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Warranty Exclusions
                    </h2>
                    <p>
                        Coverage does not extend to unauthorized modifications, deep-water immersion beyond IP ratings, or software tampering that breaks official standards.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Claims Process
                    </h2>
                    <p>
                        To activate a warranty claim, verify your purchase through the Support Center and provide your order number. Our team will then begin your claim process.
                    </p>
                </div>
            </section>
        </ContentLayout>
    )
}

