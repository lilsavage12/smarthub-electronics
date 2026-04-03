import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/server-auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const showAll = searchParams.get("all") === "true"

        let query = (showAll ? supabaseAdmin : supabase)
            .from('Banner')
            .select('*')
            .order('order', { ascending: true })

        if (!showAll) {
            query = query.eq('isActive', true)
        }

        const { data: banners, error } = await query

        if (error) throw error
        return NextResponse.json(banners || [])
    } catch (error) {
        console.error("Supabase Banners fetch error", error)
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }

        const body = await req.json()
        const { id, ...data } = body

        if (id) {
            // Update existing using Admin client to bypass any RLS for admin dashboard
            const { data: updated, error } = await supabaseAdmin
                .from('Banner')
                .update({ ...data, updatedAt: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()
            
            if (error) {
                console.error("Banner Update Error (Admin):", error)
                throw error
            }
            return NextResponse.json(updated)
        } else {
            // New Banner
            const { data: created, error } = await supabaseAdmin
                .from('Banner')
                .insert([{
                    ...data,
                    isActive: data.isActive ?? true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }])
                .select()
                .single()

            if (error) {
                console.error("Banner Create Error (Admin):", error)
                throw error
            }
            return NextResponse.json(created)
        }
    } catch (error: any) {
        console.error("Supabase Banner sync error:", error)
        return NextResponse.json({ 
            error: error.message || "Failed to process banner",
            details: typeof error === 'object' ? { 
                message: error.message, 
                code: error.code, 
                hint: error.hint,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            } : String(error)
        }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

        const { error } = await supabaseAdmin.from('Banner').delete().eq('id', id)
        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Banner DELETE Failure:", error)
        return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
    }
}
