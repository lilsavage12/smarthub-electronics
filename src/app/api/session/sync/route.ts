import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { viewed, flashSale, tradeIns } = body
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (!deviceId) {
            return NextResponse.json({ error: "Device identifier not found" }, { status: 400 })
        }

        const { data: existingSession } = await supabase
            .from('DeviceSession')
            .select('*')
            .eq('deviceId', deviceId)
            .maybeSingle()

        const userId = existingSession?.userId

        const upsertData = {
            deviceId,
            userId,
            viewed: viewed ? JSON.stringify(viewed) : (existingSession?.viewed || "[]"),
            flashSale: flashSale ? JSON.stringify(flashSale) : (existingSession?.flashSale || "[]"),
            tradeIns: tradeIns ? JSON.stringify(tradeIns) : (existingSession?.tradeIns || "[]"),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        }

        const { data: session, error } = await supabase
            .from('DeviceSession')
            .upsert([upsertData], { onConflict: 'deviceId' })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, session })

    } catch (error) {
        console.error("Supabase Session Sync Error:", error)
        return NextResponse.json({ error: "Failed to sync device session" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (!deviceId) return NextResponse.json({ error: "No device ID" }, { status: 404 })

        const { data: currentSession, error: fetchError } = await supabase
            .from('DeviceSession')
            .select('*')
            .eq('deviceId', deviceId)
            .maybeSingle()

        if (fetchError) throw fetchError

        // If this device is associated with a user, try to find their most recent data across any device
        if (currentSession?.userId) {
            const { data: userSession, error: userFetchError } = await supabase
                .from('DeviceSession')
                .select('*')
                .eq('userId', currentSession.userId)
                .order('updatedAt', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (!userFetchError && userSession) {
                return NextResponse.json({
                    viewed: JSON.parse(userSession.viewed || "[]"),
                    flashSale: JSON.parse(userSession.flashSale || "[]"),
                    tradeIns: JSON.parse(userSession.tradeIns || "[]")
                })
            }
        }

        if (!currentSession) return NextResponse.json({ error: "No session found" }, { status: 404 })

        return NextResponse.json({
            viewed: JSON.parse(currentSession.viewed || "[]"),
            flashSale: JSON.parse(currentSession.flashSale || "[]"),
            tradeIns: JSON.parse(currentSession.tradeIns || "[]")
        })

    } catch (error) {
        console.error("Supabase Session Sync GET Error:", error)
        return NextResponse.json({ error: "Sync error" }, { status: 500 })
    }
}
