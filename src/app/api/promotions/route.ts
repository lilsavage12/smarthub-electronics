
import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const body = await req.json()
        const { 
            title, type, value, category, startDate, endDate, 
            products, bannerUrl, description, isExclusive, showOnHome 
        } = body

        // 1. Create Promotion using admin client (bypass RLS)
        const { data: promotion, error: pError } = await supabaseAdmin
            .from('Promotion')
            .insert([{
                title,
                type,
                value: parseFloat(value),
                category,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                isActive: true,
                bannerUrl: bannerUrl || null,
                description: description || null,
                isExclusive: isExclusive || false,
                showOnHome: showOnHome !== undefined ? showOnHome : true,
                priority: category === "FLASH_SALE" ? 10 : category === "SEASONAL" ? 5 : category === "DAILY_DEAL" ? 3 : 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (pError) throw pError

        // 2. Link Products if any using admin client
        if (products && products.length > 0) {
            const links = products
                .filter((p: any) => p.id && p.id !== "undefined")
                .map((p: any) => ({
                    promotionId: promotion.id,
                    productId: p.id,
                    saleStock: p.saleStock
                }))
            
            if (links.length > 0) {
                const { error: ppError } = await supabaseAdmin
                    .from('PromotionProduct')
                    .insert(links)
                
                if (ppError) throw ppError
            }
        }

        return NextResponse.json(promotion)
    } catch (error: any) {
        console.error("Promotion creation error:", error)
        return NextResponse.json({ error: "Failed to create promotion", details: error.message }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const showOnHome = searchParams.get('showOnHome')
        const activeOnly = searchParams.get('activeOnly')
        const now = new Date().toISOString()

        let query = supabase
            .from('Promotion')
            .select('*, products:PromotionProduct(productId, saleStock, soldInPromo)')
            .eq('isActive', true)
            .order('priority', { ascending: false })
            .order('createdAt', { ascending: false })

        if (category) {
            query = query.eq('category', category)
        }
        if (showOnHome === 'true') {
            query = query.eq('showOnHome', true)
                .lte('startDate', now)
                .gte('endDate', now)
        }
        if (activeOnly === 'true') {
            query = query.lte('startDate', now)
                .gte('endDate', now)
        }

        const { data: promotions, error } = await query

        if (error) throw error
        return NextResponse.json(promotions)
    } catch (error: any) {
        console.error("Promotion load error:", error)
        return NextResponse.json({ error: "Failed to load promotions" }, { status: 500 })
    }
}
