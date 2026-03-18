
import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        
        if (!id || id === "undefined") {
            return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 })
        }
        const body = await req.json()
        const { products, id: bodyId, ...updateData } = body

        // 1. Update Promotion using admin client (bypass RLS)
        const { data, error } = await supabaseAdmin
            .from('Promotion')
            .update({
                ...updateData,
                updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // 2. Update Product Links if provided using admin client
        if (products !== undefined) {
            // Delete old links
            await supabaseAdmin.from('PromotionProduct').delete().eq('promotionId', id)
            
            // Insert new links
            if (products.length > 0) {
                const links = products
                    .filter((p: any) => p.id && p.id !== "undefined")
                    .map((p: any) => ({
                        promotionId: id,
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
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Promotion Update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        if (!id || id === "undefined") {
            return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 })
        }

        // Delete links first using admin client
        await supabaseAdmin.from('PromotionProduct').delete().eq('promotionId', id)
        
        const { error } = await supabaseAdmin
            .from('Promotion')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
