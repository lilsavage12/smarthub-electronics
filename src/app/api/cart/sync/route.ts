import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

/**
 * MISSION CRITICAL: Cart Synchronization Layer
 * Handles the merging of guest (local) cart data with the persistent database account.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { userId, items } = body

        if (!userId) {
            return NextResponse.json({ error: "Identity token required for synchronization" }, { status: 400 })
        }

        // 1. Identity Bridge: Ensure we are using the primary UUID but aware of legacy CUIDs
        let legacyId = null;
        let userEmail = null;
        
        if (userId.startsWith('cm')) {
            const { data: userData } = await supabaseAdmin.from('User').select('id, email').eq('id', userId).maybeSingle();
            if (userData?.email) {
                userEmail = userData.email;
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
                    userEmail = authUser.email;
                    const { data: legacyUser } = await supabaseAdmin.from('User').select('id').eq('email', authUser.email).maybeSingle();
                    if (legacyUser && legacyUser.id !== userId) {
                        legacyId = legacyUser.id;
                    }
                }
            }
        }

        // 1b. Short-circuit if only fetching current state
        if (!items || !Array.isArray(items) || items.length === 0) {
             const { data: currentItems } = await supabaseAdmin
                .from('CartItem')
                .select('*, product:Product(id, name, price, image, stock)')
                .eq('userId', userId);
                
             return NextResponse.json({ 
                items: (currentItems || []).map((item: any) => ({
                    id: item.id,
                    productId: item.productId,
                    name: item.product?.name || item.products?.name,
                    price: item.product?.price || item.products?.price,
                    image: item.product?.image || item.products?.image || "",
                    quantity: item.quantity,
                    color: item.color,
                    storage: item.storage
                }))
             });
        }

        console.log(`Syncing Cart for User: ${userId} (${items.length} items to merge)`)

        // 2. Fetch all products involved to check stock & valid prices
        const productIds = Array.from(new Set(items.map((i: any) => i.productId || i.id)));
        const { data: products } = await supabaseAdmin
            .from('Product')
            .select('id, stock, price, name')
            .in('id', productIds);

        // 3. Fetch existing DB items for this user (including legacy items)
        const userIdsToFetch = legacyId ? [userId, legacyId] : [userId];
        const { data: dbItems } = await supabaseAdmin
            .from('CartItem')
            .select('*')
            .in('userId', userIdsToFetch);

        const mergedItems: any[] = [];
        const dbItemsMap = new Map();
        dbItems?.forEach(item => {
            const key = `${item.productId}-${item.color || ''}-${item.storage || ''}`;
            dbItemsMap.set(key, item);
        });

        // 4. Process Merging Logic
        for (const localItem of items) {
            const pId = localItem.productId || localItem.id;
            const product = products?.find(p => p.id === pId);
            if (!product) continue;

            const key = `${pId}-${localItem.color || ''}-${localItem.storage || ''}`;
            const existing = dbItemsMap.get(key);

            let finalQty = (existing?.quantity || 0) + localItem.quantity;
            // Respect Stock Limits
            if (finalQty > product.stock) {
                console.warn(`Stock limit reached for ${product.name}. Capping ${finalQty} to ${product.stock}`);
                finalQty = product.stock;
            }

            if (finalQty <= 0) continue;

            mergedItems.push({
                id: existing?.id, // Keep existing ID if updating
                userId,
                productId: pId,
                quantity: finalQty,
                priceSnapshot: product.price,
                color: localItem.color || null,
                storage: localItem.storage || null,
                updatedAt: new Date().toISOString()
            });
            
            // Remove from map so we know what's left in DB only
            dbItemsMap.delete(key);
        }

        // 5. Add back items that were only in DB
        dbItemsMap.forEach(item => {
            mergedItems.push(item);
        });

        // 6. Persistence: Atomic Upsert
        if (mergedItems.length > 0) {
            const { error: upsertError } = await supabaseAdmin
                .from('CartItem')
                .upsert(mergedItems, { onConflict: 'userId,productId,color,storage' } as any)

            if (upsertError) {
                console.error("Cart Sync Persistence Failure:", upsertError);
                // Fallback to manual loop if composite unique constraint is missing
                for (const item of mergedItems) {
                   if (item.id) {
                       await supabaseAdmin.from('CartItem').update({ quantity: item.quantity }).eq('id', item.id);
                   } else {
                       await supabaseAdmin.from('CartItem').insert([item]);
                   }
                }
            }
        }

        // 7. Final Payload: Return the absolute truth from DB (Flattened for UI consumption)
        const { data: finalCart } = await supabaseAdmin
            .from('CartItem')
            .select('*, product:Product(id, name, price, image, stock)') // Singular 'product'
            .eq('userId', userId);

        return NextResponse.json({ 
            success: true, 
            items: (finalCart || []).map((item: any) => ({
                id: item.id,
                productId: item.productId,
                name: item.product?.name,
                price: item.product?.price,
                image: item.product?.image || "",
                quantity: item.quantity,
                color: item.color,
                storage: item.storage
            })),
            message: "Protocol synchronized: Guest manifest merged with enterprise account"
        });

    } catch (error: any) {
        console.error("Cart Sync Fault:", error);
        return NextResponse.json({ error: "Fault in synchronization circuit", details: error.message }, { status: 500 });
    }
}
