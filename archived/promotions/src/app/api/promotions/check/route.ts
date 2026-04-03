
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
    const results: any = {}
    
    try {
        const { error: pError } = await supabase.from('Promotion').select('id').limit(1)
        results.Promotion = !pError || pError.code !== 'PGRST116'
        
        const { error: ppError } = await supabase.from('PromotionProduct').select('promotionId').limit(1)
        results.PromotionProduct = !ppError || ppError.code !== 'PGRST116'
        
        return NextResponse.json(results)
    } catch (e: any) {
        return NextResponse.json({ error: e.message })
    }
}
