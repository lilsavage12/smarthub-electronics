/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User Dashboard and related synchronization functionality have been detached.
 * Relocated from original path for easy restoration.
 */
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

        if (!items || !Array.isArray(items) || items.length === 0) {
             const { data: currentItems } = await supabaseAdmin
                .from('CartItem')
                .select('*, product:Product(*)')
                .eq('userId', userId);
                
             return NextResponse.json({ 
                items: (currentItems || []).map((item: any) => {
                    const product = item.product;
                    return {
                        id: item.id,
                        productId: item.productId,
                        name: product?.name || "Premium Flagship",
                        price: product?.price || 0,
                        image: product?.image || "",
                        quantity: item.quantity,
                        color: item.color,
                        storage: item.storage
                    };
                })
             });
        }

        console.log(`Syncing Cart for User: ${userId} (${items.length} items to merge)`)

        // 2. Fetch all products
        const productIds = Array.from(new Set(items.map((i: any) => i.productId).filter((id: any): id is string => !!id)));
        const { data: products } = await supabaseAdmin
            .from('Product')
            .select('id, stock, price, name')
            .in('id', productIds);
        
        // 3. Fetch existing DB items for this user
        const { data: dbItems } = await supabaseAdmin
            .from('CartItem')
            .select('*')
            .eq('userId', userId);

        const mergedItems: any[] = [];
        const dbItemsMap = new Map();
        dbItems?.forEach(item => {
            const key = `${item.productId}-${item.color || ''}-${item.storage || ''}`;
            dbItemsMap.set(key, item);
        });

        // 4. Process Merging Logic
        for (const localItem of items) {
            const pId = localItem.productId;
            const product = products?.find(p => p && p.id === pId);
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
        }
        
        // 5. Persistence: Atomic Upsert for Local Merges
        if (mergedItems.length > 0) {
            // Manual Record Resolution (resilient to constraint issues)
            for (const item of mergedItems) {
               if (item.id) {
                   await supabaseAdmin.from('CartItem').update({ 
                       quantity: item.quantity,
                       updatedAt: new Date().toISOString()
                   }).eq('id', item.id);
               } else {
                   // Check to prevent duplicates
                   const { data: check } = await supabaseAdmin.from('CartItem')
                       .select('id').eq('userId', userId).eq('productId', item.productId)
                       .eq('color', item.color).eq('storage', item.storage).maybeSingle();
                   
                   if (check) {
                       await supabaseAdmin.from('CartItem').update({ 
                           quantity: item.quantity,
                           updatedAt: new Date().toISOString()
                       }).eq('id', check.id);
                   } else {
                       await supabaseAdmin.from('CartItem').insert([{
                           userId: item.userId,
                           productId: item.productId,
                           quantity: item.quantity,
                           priceSnapshot: item.priceSnapshot,
                           color: item.color,
                           storage: item.storage,
                           createdAt: new Date().toISOString(),
                           updatedAt: new Date().toISOString()
                       }]);
                   }
               }
            }
        }

        // 7. Final Payload: Return the absolute truth from DB
        const { data: finalCart } = await supabaseAdmin
            .from('CartItem')
            .select('*, product:Product(*)')
            .eq('userId', userId);

        return NextResponse.json({ 
            success: true, 
            items: (finalCart || []).map((item: any) => {
                const product = item.product;
                return {
                    id: item.id,
                    productId: item.productId,
                    name: product?.name || "Premium Flagship",
                    price: product?.price || 0,
                    image: product?.image || "",
                    quantity: item.quantity,
                    color: item.color,
                    storage: item.storage
                };
            }),
            message: "Protocol synchronized: Guest manifest merged with enterprise account"
        });

    } catch (error: any) {
        console.error("Cart Sync Fault:", error);
        return NextResponse.json({ error: "Fault in synchronization circuit", details: error.message }, { status: 500 });
    }
}


