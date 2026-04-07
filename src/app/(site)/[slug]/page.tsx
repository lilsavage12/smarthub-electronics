import { supabaseAdmin } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Metadata } from "next"

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const { data: page } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

    if (!page) return { title: "Page Not Found | SmartHub" }

    return {
        title: `${page.seoTitle || page.title} | SmartHub`,
        description: page.seoDescription || "Information cluster for SmartHub Electronics.",
    }
}

export default async function DynamicPolicyPage({ params }: PageProps) {
    const { slug } = await params
    const { data: page } = await supabaseAdmin
        .from('CmsPage')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

    if (!page || page.status !== "PUBLISHED") {
        notFound()
    }

    return (
        <main className="min-h-screen bg-background pt-32 pb-24 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col gap-4 border-b border-border pb-12">
                    <h1 className="text-5xl md:text-7xl font-black  tracking-tighter uppercase leading-none text-foreground">
                        {page.title}
                    </h1>
                </div>

                {/* Content Narrative */}
                <div className="prose prose-invert prose-slate max-w-none">
                    <div 
                        className="text-muted-foreground leading-relaxed text-lg font-medium space-y-8 uppercase tracking-tight  opacity-90"
                        dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
                    />
                </div>
            </div>
        </main>
    )
}

