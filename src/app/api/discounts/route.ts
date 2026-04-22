import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/server-auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const body = await req.json()
        const { 
            code, type, value, maxUses, startDate, endDate, 
            minPurchase, campaign, status, 
            applicableCategories, applicableBrands 
        } = body

        // 1. Check for duplicate code
        const { data: cloudExisting, error: checkError } = await supabaseAdmin
            .from('Discount')
            .select('code')
            .eq('code', code)
            .maybeSingle()

        if (checkError) throw checkError
        if (cloudExisting) {
            return NextResponse.json({ error: "This code already exists" }, { status: 400 })
        }

        // 2. Create in Supabase
        const { data: discount, error } = await supabaseAdmin
            .from('Discount')
            .insert({
                id: crypto.randomUUID(),
                code,
                type,
                value, // Keep as string format (e.g. "15%", "$100")
                maxUses: maxUses ? parseInt(maxUses) : null,
                startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : null,
                minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
                campaign: campaign || "General Promotion",
                status: status || "Active",
                applicableCategories: applicableCategories || [],
                applicableBrands: applicableBrands || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(discount)
    } catch (error: any) {
        console.error("Supabase Discount creation failed:", error)
        return NextResponse.json({ 
            error: "Failed to create discount entry", 
            details: error.message || "Unknown persistence error" 
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        
        const { data: discounts, error } = await supabaseAdmin
            .from('Discount')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error

        return NextResponse.json(discounts)
    } catch (error: any) {
        console.error("Supabase Discount Load failure DETAIL:", error)
        return NextResponse.json({ 
            error: "Failed to load discounts",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_SYNC_ERROR"
        }, { status: 500 })
    }
}

