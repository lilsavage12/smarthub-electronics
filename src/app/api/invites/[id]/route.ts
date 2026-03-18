import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { error } = await supabase.from('Invite').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ message: "Invite deleted" })
    } catch (error) {
        console.error("Supabase Invite Delete Error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
