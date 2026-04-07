import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ContentLayout } from "@/components/site/ContentLayout"
import { Activity, Scale, Package, Shield, Gavel } from "lucide-react"

export const metadata = {
    title: "Terms and Conditions | SmartHub Electronics",
    description: "Official terms and conditions for site usage and operations."
}

export default async function TermsAndConditionsPage() {
    const { data: pageData } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', 'terms-and-conditions')
        .maybeSingle()

    if (pageData && pageData.status === "PUBLISHED") {
        return (
            <ContentLayout 
                badge="Company Policy" 
                title={pageData.title.toUpperCase()} 
                description={pageData.seoDescription || "Official policy documentation from our central database."}
                updatedAt={new Date(pageData.updatedAt).toLocaleDateString()}
                icon={Scale}
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
            badge="Legal Agreement" 
            title={<>TERMS & <span className='text-primary '>CONDITIONS</span></>} 
            description="The terms and conditions governing your access to the SmartHub platform."
            updatedAt="Updated Q2 2024"
            icon={Scale}
        >
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        <Shield className="w-8 h-8 text-primary" /> Agreement Overview
                    </h2>
                    <p>
                        By accessing our website and services, you agree to comply with all terms of service. This agreement constitutes a legally binding agreement between you and SmartHub Electronics.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        <Package className="w-8 h-8 text-primary" /> Product Information
                    </h2>
                    <p>
                        Our pricing system ensures that the most accurate pricing is shown. However, SmartHub reserves the right to correct any data errors or pricing inaccuracies at our discretion. All purchases are subject to product availability.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        <Activity className="w-8 h-8 text-primary" /> Intellectual Property
                    </h2>
                    <p>
                        The SmartHub design and branding, including all assets, icons, and layout structures, is the exclusive intellectual property of SmartHub Electronics. Unauthorized duplication of our user interface and experience is strictly prohibited.
                    </p>
                    <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 flex flex-col gap-4 text-indigo-500 shadow-xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]  mb-2">Notice:</span>
                        <p className="text-md font-bold uppercase tracking-tight  opacity-90 leading-tight">
                            SmartHub reserves the right to terminate access to any user bypassing security measures or attempting to interfere with our systems.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        Governing Law
                    </h2>
                    <p>
                        This agreement is governed by the laws of our primary jurisdiction. Any disputes arising from service usage shall be adjudicated within the appropriate legal courts.
                    </p>
                </div>
            </section>
        </ContentLayout>
    )
}

