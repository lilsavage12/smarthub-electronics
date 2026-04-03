/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User Dashboard and related synchronization functionality have been detached.
 * Relocated from original path for easy restoration.
 */
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

/**
 * MISSION CRITICAL: Wishlist Synchronization Layer
 * Synchronizes unique product preferences across devices.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { userId, items } = body

        if (!userId) {
            return NextResponse.json({ error: "Identity token required" }, { status: 400 })
        }

        // Identity Alignment Logic
        if (userId.startsWith('cm')) {
            const { data: userData } = await supabaseAdmin.from('User').select('id, email').eq('id', userId).maybeSingle();
            if (userData?.email) {
                const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
                if (!uError && usersData?.users) {
                    const actualUser = usersData.users.find((u: any) => u.email === userData.email);
                    if (actualUser) userId = actualUser.id;
                }
            }
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
             const { data: currentItems, error } = await supabaseAdmin
                .from('WishlistItem')
                .select('id, productId, product:Product(*)')
                .eq('userId', userId);
             
             if (error) throw error

             return NextResponse.json({ 
                items: (currentItems || []).map((item: any) => {
                    const product = Array.isArray(item.product) ? item.product[0] : item.product;
                    return {
                        id: item.id,
                        productId: item.productId,
                        name: product?.name || "Premium Flagship",
                        price: product?.price || 0,
                        image: product?.image || "/images/placeholder.png"
                    };
                })
             });
        }

        console.log(`Supabase: Syncing Wishlist for User: ${userId} (${items.length} items to merge)`)

        // 2. Fetch existing DB items
        const { data: dbItems, error: dbError } = await supabaseAdmin.from('WishlistItem').select('*').eq('userId', userId);
        if (dbError) throw dbError
        
        const existingProductIds = new Set(dbItems?.map(i => i.productId));
        const newProductIds = Array.from(new Set(items.map((i: any) => i.productId || i.id)));

        // 3. Merging
        const toInsert: any[] = [];
        for (const pId of newProductIds) {
            if (!existingProductIds.has(pId)) {
                toInsert.push({
                    userId,
                    productId: pId
                });
            }
        }

        // 4. Persistence
        if (toInsert.length > 0) {
            const { error: insertError } = await supabaseAdmin.from('WishlistItem').insert(toInsert);
            if (insertError) throw insertError
        }

        // 5. Final Registry Fetch
        const { data: finalWishlist, error: finalError } = await supabaseAdmin
            .from('WishlistItem')
            .select('id, productId, product:Product(*)')
            .eq('userId', userId);

        if (finalError) throw finalError

        return NextResponse.json({ 
            items: (finalWishlist || [])
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
                .filter((item: any) => !!item.name),
            message: "Wishlist synchronized across digital assets"
        });

    } catch (error: any) {
        console.error("Supabase Wishlist Sync Fault:", error);
        return NextResponse.json({ error: "Fault in preference synchronization", details: error.message }, { status: 500 });
    }
}


