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

        // 1. Identity Bridge: Ensure we are using the primary UUID but aware of legacy CUIDs
        let legacyId = null;
        if (userId.startsWith('cm')) {
            const { data: userData } = await supabaseAdmin.from('User').select('id, email').eq('id', userId).maybeSingle();
            if (userData?.email) {
                const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
                if (!uError && usersData?.users) {
                    const actualUser = usersData.users.find((u: any) => u.email === userData.email);
                    if (actualUser) {
                        legacyId = userId;
                        userId = actualUser.id;
                    }
                }
            }
        } else {
            const { data: usersData, error: uError } = await supabaseAdmin.auth.admin.listUsers();
            if (!uError && usersData?.users) {
                const authUser = usersData.users.find((u: any) => u.id === userId);
                if (authUser?.email) {
                    const { data: legacyUser } = await supabaseAdmin.from('User').select('id').eq('email', authUser.email).maybeSingle();
                    if (legacyUser && legacyUser.id !== userId) {
                        legacyId = legacyUser.id;
                    }
                }
            }
        }

        const userIdsToFetch = legacyId ? [userId, legacyId] : [userId];

        // 1b. Short-circuit if only fetching current state
        if (!items || !Array.isArray(items) || items.length === 0) {
             const { data: currentItems } = await supabaseAdmin
                .from('WishlistItem')
                .select('id, productId, product:Product(*)')
                .in('userId', userIdsToFetch);
                
             return NextResponse.json({ 
                items: (currentItems || []).map((item: any) => ({
                    id: item.id,
                    productId: item.productId,
                    name: item.product?.name || item.products?.name || "Premium Flagship",
                    price: item.product?.price || item.products?.price || 0,
                    image: item.product?.image || item.products?.image || "/images/placeholder.png"
                }))
             });
        }

        console.log(`Syncing Wishlist for User: ${userId} (${items.length} items to merge)`)

        // 2. Fetch existing DB items (including legacy)
        const userIdsToFetch = legacyId ? [userId, legacyId] : [userId];
        const { data: dbItems } = await supabaseAdmin.from('WishlistItem').select('*').in('userId', userIdsToFetch);
        
        const existingProductIds = new Set(dbItems?.map(i => i.productId));
        const newProductIds = Array.from(new Set(items.map((i: any) => i.productId || i.id)));

        // 3. Merging
        const toInsert: any[] = [];
        for (const pId of newProductIds) {
            if (!existingProductIds.has(pId)) {
                toInsert.push({
                    userId,
                    productId: pId,
                    createdAt: new Date().toISOString()
                });
            }
        }

        // 4. Persistence
        if (toInsert.length > 0) {
            await supabaseAdmin.from('WishlistItem').insert(toInsert);
        }

        // 4b. Migration: Cleanup legacy wishlist items
        if (legacyId) {
            await supabaseAdmin.from('WishlistItem').delete().eq('userId', legacyId);
        }

        // 5. Return absolute state
        const { data: finalWishlist } = await supabaseAdmin
            .from('WishlistItem')
            .select('id, productId, product:Product(*)') // Prefer singular for consistency
            .eq('userId', userId);

        return NextResponse.json({ 
            items: (finalWishlist || [])
                .filter((item: any) => !!item.product)
                .map((item: any) => ({
                    id: item.id,
                    productId: item.productId,
                    name: item.product?.name || "Premium Flagship",
                    price: item.product?.price || 0,
                    image: item.product?.image || "/images/placeholder.png"
                })),
            message: "Wishlist synchronized across digital assets"
        });

    } catch (error: any) {
        console.error("Wishlist Sync Fault:", error);
        return NextResponse.json({ error: "Fault in preference synchronization", details: error.message }, { status: 500 });
    }
}
