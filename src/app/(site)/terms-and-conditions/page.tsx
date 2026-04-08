import React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { ContentLayout } from "@/components/site/ContentLayout"
import { Activity, Scale, Package, Shield, Gavel } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = {
    title: "Terms & Conditions",
    description: "Official terms and conditions for site usage and operations."
}

export default async function TermsAndConditionsPage() {
    // Attempt to fetch from primary CMS table
    let { data: pageData } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', 'terms-and-conditions')
        .maybeSingle()

    // Fallback to legacy PolicyPage table if not found
    if (!pageData) {
        const { data: legacyData } = await supabaseAdmin
            .from('PolicyPage')
            .select('*')
            .eq('slug', 'terms-and-conditions')
            .maybeSingle()
        pageData = legacyData
    }

    if (!pageData || pageData.status !== "PUBLISHED") {
        return notFound()
    }

    const content = pageData.content || ""
    const formattedDate = pageData.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString() : "Recently"

    return (
        <ContentLayout 
            badge="Company Policy" 
            title={pageData.title?.toUpperCase() || "TERMS & CONDITIONS"} 
            description={pageData.seoDescription || "Official policy documentation from our central database."}
            updatedAt={formattedDate}
            icon={Scale}
        >
            <div 
                className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg font-medium space-y-8 uppercase tracking-tight opacity-90"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
            />
        </ContentLayout>
    )
}

