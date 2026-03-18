import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
// Sync Engine v1.0.1

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ items: [] })
    }

    if (userId) {
      let email: string | null = null;
      let cuid: string | null = null;
      let uuid: string | null = null;

      if (userId.startsWith('cm')) {
        const { data: userData } = await supabaseAdmin.from('User').select('email').eq('id', userId).maybeSingle();
        if (userData?.email) {
          email = userData.email;
          cuid = userId;
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          uuid = users.find((u: any) => u.email === email)?.id || null;
        }
      } else {
        const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
        if (!uError && usersData?.users) {
          const authUser = usersData.users.find((u: any) => u.id === userId);
          if (authUser?.email) {
            email = authUser.email;
            uuid = userId;
            const { data: userData } = await supabaseAdmin.from('User').select('id').eq('email', email).maybeSingle();
            cuid = userData?.id;
          }
        }
      }

      if (cuid && uuid && cuid !== uuid) {
        await supabaseAdmin.from('WishlistItem').update({ userId: uuid }).eq('userId', cuid);
        userId = uuid;
      }
    }

    const { data: items, error } = await supabaseAdmin
      .from('WishlistItem')
      .select('id, productId, product:Product(name, image, price)')
      .eq('userId', userId)

    if (error) throw error

    const formattedItems = (items || [])
      .map((item: any) => {
        const product = Array.isArray(item.product) ? item.product[0] : item.product;
        return {
          id: item.id,
          productId: item.productId,
          name: product?.name || "Premium Flagship",
          price: product?.price || 0,
          image: product?.image || "/images/placeholder.png"
        };
      })
      .filter((item: any) => !!item.name); // Final safety gate for UI Manifest

    return NextResponse.json({ items: formattedItems })
  } catch (error: any) {
    console.error("Wishlist Fetch Error:", error)
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

    if (userId.startsWith('cm')) {
      const { data: userData } = await supabaseAdmin.from('User').select('email').eq('id', userId).maybeSingle();
      if (userData?.email) {
        const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
        if (!uError && usersData?.users) {
          const actualUser = usersData.users.find((u: any) => u.email === userData.email);
          if (actualUser) userId = actualUser.id;
        }
      }
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
    console.error("Wishlist Add Error:", error)
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
      const { error } = await supabase.from('WishlistItem').delete().eq('id', id)
      if (error) throw error
    } else if (userId && productId) {
      const { error } = await supabase.from('WishlistItem').delete().eq('userId', userId).eq('productId', productId)
      if (error) throw error
    } else if (userId) {
      const { error } = await supabase.from('WishlistItem').delete().eq('userId', userId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Wishlist Delete Error:", error)
    return NextResponse.json({ error: "Failed delete", details: error.message }, { status: 500 })
  }
}
