import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        
        if (!id || id === "undefined") {
            return NextResponse.json({ error: "Invalid promotion ID" }, { status: 400 })
        }
        
        const body = await req.json()
        const { productIds, id: bodyId, ...updateData } = body

        // Mapping to standard DB columns (title/value)
        const validUpdate = {
            title: updateData.title || updateData.name,
            value: Number(updateData.value || updateData.discount || 10),
            type: updateData.type || "PERCENTAGE",
            category: updateData.category || "REGULAR",
            startDate: updateData.startDate,
            endDate: updateData.endDate === "NEVER" || !updateData.endDate ? null : updateData.endDate,
            isActive: updateData.isActive !== undefined ? updateData.isActive : true,
            description: updateData.description || null,
            priority: Number(updateData.priority || 0),
            saleStock: (updateData.saleStock !== undefined && updateData.saleStock !== null && updateData.saleStock !== "") ? Math.floor(Number(updateData.saleStock)) : null,
            showOnHome: updateData.showOnHome !== undefined ? updateData.showOnHome : true,
            updatedAt: new Date().toISOString()
        }

        const { data, error } = await supabaseAdmin
            .from('Promotion')
            .update(validUpdate)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error("Supabase Promotion Update error:", error)
            throw error
        }

        // Update Links
        const targetIds = Array.isArray(productIds) ? productIds : (updateData.productId ? [updateData.productId] : [])
        if (targetIds.length > 0) {
            await supabaseAdmin.from('PromotionProduct').delete().eq('promotionId', id)
            const links = targetIds.map(pid => ({
                promotionId: id,
                productId: String(pid),
                saleStock: (updateData.saleStock !== undefined && updateData.saleStock !== null && updateData.saleStock !== "") ? Math.floor(Number(updateData.saleStock)) : null
            }))
            const { error: linkError } = await supabaseAdmin.from('PromotionProduct').insert(links)
            if (linkError) {
                console.error("Supabase Promotion Update - Link error:", linkError)
                throw linkError
            }
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Supabase Promotion Update error:", error)
        return NextResponse.json({ 
            error: "Failed to update promotion", 
            details: error.message || "Something went wrong"
        }, { status: 500 })
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

        // Cloud Delete
        await supabaseAdmin.from('PromotionProduct').delete().eq('promotionId', id)
        const { error } = await supabaseAdmin.from('Promotion').delete().eq('id', id)
        if (error) throw error
        
        return NextResponse.json({ success: true, origin: "cloud" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

