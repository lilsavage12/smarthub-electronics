import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        const { data: addresses, error } = await supabase
            .from('Address')
            .select('*')
            .eq('userId', userId)
            .order('isDefault', { ascending: false })
            .order('createdAt', { ascending: false })

        if (error) throw error

        return NextResponse.json(addresses)
    } catch (error) {
        console.error("Supabase Address Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, isDefault, ...addressData } = body

        if (!userId || !addressData.fullName || !addressData.phone || !addressData.street || !addressData.city) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (isDefault) {
            await supabase
                .from('Address')
                .update({ isDefault: false })
                .eq('userId', userId)
                .eq('isDefault', true)
        }

        const { data: address, error } = await supabase
            .from('Address')
            .insert([{
                ...addressData,
                userId,
                isDefault: isDefault || false,
                country: addressData.country || "Kenya",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(address)
    } catch (error) {
        console.error("Supabase Address Creation Error:", error)
        return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, userId, isDefault, ...updateData } = body

        if (!id || !userId) {
            return NextResponse.json({ error: "Address ID and User ID are required" }, { status: 400 })
        }

        if (isDefault) {
            await supabase
                .from('Address')
                .update({ isDefault: false })
                .eq('userId', userId)
                .eq('isDefault', true)
        }

        const { data: address, error } = await supabase
            .from('Address')
            .update({
                ...updateData,
                isDefault,
                updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(address)
    } catch (error) {
        console.error("Supabase Address Update Error:", error)
        return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Address ID is required" }, { status: 400 })
        }

        const { error } = await supabase.from('Address').delete().eq('id', id)
        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Supabase Address Deletion Error:", error)
        return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
    }
}
