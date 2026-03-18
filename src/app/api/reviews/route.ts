import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    try {
        let query = supabase.from('Review').select('*')
        if (productId) {
            query = query.eq('productId', productId)
        }
        
        const { data: reviews, error } = await query.order('createdAt', { ascending: false })
        if (error) throw error
        
        return NextResponse.json(reviews)
    } catch (error) {
        console.error("Supabase Review Fetch Error:", error)
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { data: review, error } = await supabase
            .from('Review')
            .insert([{
                ...body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(review)
    } catch (error) {
        console.error("Supabase Review Create Error:", error)
        return NextResponse.json({ 
            error: "Create failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
