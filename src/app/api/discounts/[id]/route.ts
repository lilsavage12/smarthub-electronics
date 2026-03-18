import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
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
        const { id: bodyId, ...updateData } = body
        
        const { data: discount, error } = await supabase
            .from('Discount')
            .update({ ...updateData, updatedAt: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(discount)
    } catch (error: any) {
        console.error("Supabase Discount Update Error:", error)
        return NextResponse.json({ error: error.message || "Failed to update discount" }, { status: 500 })
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
        const { error } = await supabase.from('Discount').delete().eq('id', id)
        
        if (error) throw error
        return NextResponse.json({ message: "Discount deleted successfully" })
    } catch (error) {
        console.error("Supabase Discount Deletion Error:", error)
        return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 })
    }
}
