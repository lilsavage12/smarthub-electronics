import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: messageId } = await params
        const body = await req.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ error: "Missing status transition" }, { status: 400 })
        }

        const { data: updatedMessage, error } = await supabaseAdmin
            .from('ContactMessage')
            .update({ status })
            .eq('id', messageId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(updatedMessage)
    } catch (error: any) {
        console.error("Supabase Contact Message Update Error:", error)
        return NextResponse.json({ error: "Failed to update inquiry status" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: messageId } = await params

        const { error } = await supabaseAdmin
            .from('ContactMessage')
            .delete()
            .eq('id', messageId)

        if (error) throw error

        return NextResponse.json({ message: "Inquiry deleted" })
    } catch (error: any) {
        console.error("Supabase Contact Message Deletion Error:", error)
        return NextResponse.json({ error: "Failed to purge inquiry" }, { status: 500 })
    }
}

