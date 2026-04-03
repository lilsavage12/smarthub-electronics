import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const { id } = await params
        if (!id || id === "undefined") {
            return NextResponse.json({ error: "Invalid discount ID" }, { status: 400 })
        }
        const body = await req.json()
        const { id: bodyId, createdAt, updatedAt, ...updateData } = body
        
        const { data: cloudDiscount, error } = await supabaseAdmin
            .from('Discount')
            .update({ ...updateData, updatedAt: new Date().toISOString() })
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error
        if (!cloudDiscount) return NextResponse.json({ error: "Discount not found" }, { status: 404 })

        return NextResponse.json(cloudDiscount)
    } catch (error: any) {
        console.error("Supabase Discount Update Failure:", error)
        return NextResponse.json({ error: error.message || "Failed to finalize update" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const { id } = await params
        if (!id || id === "undefined") {
            return NextResponse.json({ error: "Invalid discount ID" }, { status: 400 })
        }

        const { error } = await supabaseAdmin.from('Discount').delete().eq('id', id)
        if (error) throw error
        
        return NextResponse.json({ message: "Discount deleted from registry" })
    } catch (error: any) {
        console.error("Supabase Discount Deletion Failure:", error)
        return NextResponse.json({ error: "Failed to resolve deletion" }, { status: 500 })
    }
}

