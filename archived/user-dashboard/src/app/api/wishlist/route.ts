/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User authentication and related APIs have been detached.
 */
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ items: [] })
    }

    const { data: items, error } = await supabaseAdmin
      .from('WishlistItem')
      .select('id, productId, product:Product(*)')
      .eq('userId', userId)

    if (error) throw error

    const formattedItems = (items || [])
      .map((item: any) => {
        const product = item.product;
        
        return {
          id: item.id,
          productId: item.productId,
          name: product?.name || "Premium Flagship",
          price: Number(product?.price || 0),
          image: product?.image || "/images/placeholder.png",
          brand: product?.brand || "SMARTHUB"
        };
      })
      .filter((item: any) => !!item.productId);

    return NextResponse.json({ 
        items: formattedItems
    })
  } catch (error: any) {
    console.error("Supabase Wishlist Fetch Error:", error)
    return NextResponse.json({ error: "Failed fetch", details: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json({ error: "UserId and ProductId required" }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('WishlistItem')
      .select('id')
      .eq('userId', userId)
      .eq('productId', productId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, message: "Already in wishlist" })
    }

    const { data: newItem, error } = await supabaseAdmin
      .from('WishlistItem')
      .insert([{ userId, productId }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(newItem)
  } catch (error: any) {
    console.error("Supabase Wishlist Add Error:", error)
    return NextResponse.json({ error: "Failed add", details: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")

    if (id) {
      const { error } = await supabaseAdmin.from('WishlistItem').delete().eq('id', id)
      if (error) throw error
    } else if (userId && productId) {
      const { error } = await supabaseAdmin.from('WishlistItem').delete().eq('userId', userId).eq('productId', productId)
      if (error) throw error
    } else if (userId) {
      const { error } = await supabaseAdmin.from('WishlistItem').delete().eq('userId', userId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Supabase Wishlist Delete Error:", error)
    return NextResponse.json({ error: "Failed delete", details: error.message }, { status: 500 })
  }
}



