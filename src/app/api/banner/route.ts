import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
    try {
        const { data: banner, error } = await supabase
            .from('Banner')
            .select('*')
            .eq('isActive', true)
            .order('updatedAt', { ascending: false })
            .maybeSingle()

        if (error) throw error
        return NextResponse.json(banner || {})
    } catch (error) {
        console.error("Supabase Banner fetch error", error)
        return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        
        // Find existing active banner
        const { data: activeBanner, error: fetchError } = await supabase
            .from('Banner')
            .select('id')
            .eq('isActive', true)
            .order('updatedAt', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (fetchError) throw fetchError

        if (activeBanner) {
            const { data: updated, error: updateError } = await supabase
                .from('Banner')
                .update({ ...body, updatedAt: new Date().toISOString() })
                .eq('id', activeBanner.id)
                .select()
                .single()
            
            if (updateError) throw updateError
            return NextResponse.json(updated)
        } else {
            const { data: created, error: createError } = await supabase
                .from('Banner')
                .insert([{
                    ...body,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }])
                .select()
                .single()

            if (createError) throw createError
            return NextResponse.json(created)
        }
    } catch (error) {
        console.error("Supabase Banner update error", error)
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
    }
}
