import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ContentLayout } from "@/components/site/ContentLayout"
import { ShieldCheck, Zap, Smartphone } from "lucide-react"

export const metadata = {
    title: "Privacy Policy | SmartHub Electronics",
    description: "Our official data handling policy and security standards."
}

export default async function PrivacyPolicyPage() {
    const { data: pageData } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', 'privacy-policy')
        .maybeSingle()

    if (pageData && pageData.status === "PUBLISHED") {
        return (
            <ContentLayout 
                badge="Legal" 
                title={pageData.title.toUpperCase()} 
                description={pageData.seoDescription || "Official documentation regarding data privacy and security."}
                updatedAt={new Date(pageData.updatedAt).toLocaleDateString()}
                icon={ShieldCheck}
            >
                <div 
                    className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg font-medium space-y-8 uppercase tracking-tight italic opacity-90"
                    dangerouslySetInnerHTML={{ __html: pageData.content.replace(/\n/g, '<br />') }}
                />
            </ContentLayout>
        )
    }

    return (
        <ContentLayout 
            badge="Privacy Policy" 
            title={<>PRIVACY <span className='text-emerald-500 italic'>POLICY</span></>} 
            description="We care about your privacy. Here is how we protect your personal information."
            updatedAt="LAST UPDATED: MARCH 2024"
            icon={ShieldCheck}
        >
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        How We Protect Your Data
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        Your privacy is our top priority. We only collect the info we need to get your orders to you and provide support. We never sell or share your personal details with anyone who doesn't need to see them.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Top Security", icon: ShieldCheck, sub: "All your data is locked and protected with the best security tools available today." },
                            { label: "Safe Processing", icon: Zap, sub: "We handle your information directly to make sure it stays safe and private." },
                            { label: "Your Privacy First", icon: Smartphone, sub: "We hide your private details in our systems to keep you safe while you shop." }
                        ].map((card, i) => (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-muted/20 border border-border flex flex-col gap-4">
                                <card.icon size={24} className="text-primary" />
                                <span className="text-sm font-black italic uppercase tracking-widest">{card.label}</span>
                                <span className="text-[12px] font-bold opacity-50 tracking-tight leading-tight uppercase italic">{card.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Our Cookie Policy
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        We use cookies to make our website work smoothly for you. These help us show you the right items and prices in real-time for the best shopping experience.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Your Rights
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        By using SmartHub, you agree to how we handle your data. You can always ask to see or delete your personal information by contacting our Support Center.
                    </p>
                </div>
            </section>
        </ContentLayout>
    )
}

