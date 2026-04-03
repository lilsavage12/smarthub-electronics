import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
    try {
        const { data: settings, error } = await supabaseAdmin
            .from('StoreSettings')
            .select('*')
            .eq('id', 'GLOBAL')
            .maybeSingle()

        if (error) throw error

        // Initialize if not exists
        if (!settings) {
            const { data: newSettings, error: createError } = await supabaseAdmin
                .from('StoreSettings')
                .insert({ id: 'GLOBAL' })
                .select()
                .single()
            
            if (createError) throw createError
            return NextResponse.json(newSettings)
        }

        return NextResponse.json(settings)
    } catch (error: any) {
        console.error("Supabase Store Settings Fetch Error:", error)
        return NextResponse.json({ error: "Failed to retrieve store terminal settings" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { address, email, phone, hours } = body

        const { data: updatedSettings, error } = await supabaseAdmin
            .from('StoreSettings')
            .upsert({ id: 'GLOBAL', address, email, phone, hours })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(updatedSettings)
    } catch (error: any) {
        console.error("Supabase Store Settings Update Error:", error)
        return NextResponse.json({ error: "Failed to update store terminal settings" }, { status: 500 })
    }
}

