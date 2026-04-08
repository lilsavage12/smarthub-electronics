import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ContentLayout } from "@/components/site/ContentLayout"
import { Activity, Sparkles, Smartphone, Box } from "lucide-react"

export const metadata = {
    title: "About Us",
    description: "The mission and history of SmartHub Electronics."
}

export default async function AboutUsPage() {
    const { data: pageData } = await supabaseAdmin
        .from('PolicyPage')
        .select('*')
        .eq('slug', 'about-us')
        .maybeSingle()

    if (pageData && pageData.status === "PUBLISHED") {
        return (
            <ContentLayout 
                badge="About Us" 
                title={pageData.title.toUpperCase()} 
                description={pageData.seoDescription || "Official information about our company and mission."}
                updatedAt={new Date(pageData.updatedAt).toLocaleDateString()}
                icon={Activity}
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
            badge="Company Profile" 
            title={<>THE SMART<span className='text-primary decoration-primary/20 '>HUB</span> ORIGIN</>} 
            description="Setting the global standard for high-performance electronics and customer excellence."
            updatedAt="RELEASE 2024.Q2"
            icon={Activity}
        >
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-6">
                        <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        <Sparkles className="w-8 h-8 text-primary" /> Welcome to SmartHub
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        We bring you the best technology to make your life easier and more exciting. From the newest smartphones to powerful laptops, we pick each item to make sure you get top quality and great value.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                        <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        <Smartphone className="w-8 h-8 text-primary" /> Quality You Can Trust
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        Every device we sell is carefully tested to meet high standards. Whether it’s brand new or professionally refurbished, we guarantee it works perfectly and lasts long.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                        <h2 className="text-3xl md:text-5xl font-black  tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">
                        <Box className="w-8 h-8 text-primary" /> Fast & Safe Shipping
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        We serve customers worldwide with a focus on speed and safety. Your new gear is handled with extra care so it arrives at your door in perfect condition, every time.
                    </p>
                </div>
            </section>
        </ContentLayout>
    )
}

