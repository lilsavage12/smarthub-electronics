import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const city = searchParams.get("city")

        let query = supabaseAdmin
            .from('DeliveryZone')
            .select('*')
            .eq('isActive', true)
        
        if (city) {
            query = query.eq('city', city)
        }

        const { data, error } = await query.order('area', { ascending: true })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error("Delivery Zones Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch delivery zones" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { city, area, fee } = body

        if (!city || !area) {
            return NextResponse.json({ error: "City and Area are required" }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('DeliveryZone')
            .insert({
                city,
                area,
                fee: Number(fee) || 0,
                isActive: true
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, city, area, fee, isActive } = body

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

        const { data, error } = await supabaseAdmin
            .from('DeliveryZone')
            .update({ city, area, fee: Number(fee), isActive })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

        const { error } = await supabaseAdmin
            .from('DeliveryZone')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
