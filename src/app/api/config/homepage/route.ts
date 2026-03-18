import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyAdmin } from "@/lib/server-auth"

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('Settings')
            .select('*')
            .eq('key', 'homepage-config')
            .maybeSingle()
        
        if (error) throw error
        
        const config = data?.value || {
            flashSale: { visible: true, order: 1, title: "FLASH SALES" },
            dailyDeals: { visible: true, order: 2, title: "TODAY'S DEALS" },
            seasonal: { visible: true, order: 3, title: "SEASONAL CAMPAIGNS" },
            featured: { visible: true, order: 4, title: "BEST SELLERS" }
        }
        
        return NextResponse.json(config)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        if (!(await verifyAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }
        const body = await req.json()
        
        const { data, error } = await supabase
            .from('Settings')
            .upsert({ key: 'homepage-config', value: body })
            .select()
        
        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
