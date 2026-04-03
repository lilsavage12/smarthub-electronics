import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ContentLayout } from "@/components/site/ContentLayout"
import { Truck } from "lucide-react"

export const metadata = {
    title: "Shipping & Return Policy | SmartHub Electronics",
    description: "Official delivery, logistical standards, and return policies."
}

export default async function ShippingAndReturnPolicyPage() {
    const { data: pageData } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', 'shipping-and-return-policy')
        .maybeSingle()

    if (pageData && pageData.status === "PUBLISHED") {
        return (
            <ContentLayout 
                badge="Logistics" 
                title={pageData.title.toUpperCase()} 
                description={pageData.seoDescription || "Official documentation regarding shipping, delivery, and returns."}
                updatedAt={new Date(pageData.updatedAt).toLocaleDateString()}
                icon={Truck}
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
            badge="Shipping & Returns" 
            title={<>SHIPPING & <span className='text-indigo-500 italic'>RETURNS</span></>} 
            description="Our professional standards for global product delivery and quality assurance returns."
            updatedAt="RELEASE 2024.Q2"
            icon={Truck}
        >
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4 text-primary">
                        <Truck size={24} />
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground">Logistics Information</h2>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        We utilize premium shipping partners to ensure your products arrive with the utmost care. Standard delivery times average 3-5 business days depending on location. Expedited shipping is available for urgent requirements.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">Return Standards</h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        If your purchase is not up to your expectations, we offer a 14-day return window. Products must be returned in their original factory condition with all original documentation and packaging intact.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground flex items-center gap-4">Refund Methodology</h2>
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                        Refunds are processed back to the original payment method within 7-10 business days following a comprehensive product inspection and technical audit at our Support Center.
                    </p>
                </div>
            </section>
        </ContentLayout>
    )
}

