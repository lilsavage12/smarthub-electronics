import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { cart, viewed, flashSale, tradeIns } = body
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (!deviceId) {
            return NextResponse.json({ error: "Device identifier not found" }, { status: 400 })
        }

        // Persist session data to the database
        // Also check for the most recent session with this deviceId to get the userId if it exists
        const existingSession = await prisma.deviceSession.findUnique({ where: { deviceId } })
        const userId = existingSession?.userId

        const session = await prisma.deviceSession.upsert({
            where: { deviceId },
            update: {
                cart: cart ? JSON.stringify(cart) : undefined,
                viewed: viewed ? JSON.stringify(viewed) : undefined,
                flashSale: flashSale ? JSON.stringify(flashSale) : undefined,
                tradeIns: tradeIns ? JSON.stringify(tradeIns) : undefined,
                userId: userId // Maintain the association
            },
            create: {
                deviceId,
                userId,
                cart: JSON.stringify(cart || []),
                viewed: JSON.stringify(viewed || []),
                flashSale: JSON.stringify(flashSale || []),
                tradeIns: JSON.stringify(tradeIns || []),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        })

        return NextResponse.json({ success: true, session })

    } catch (error) {
        console.error("Session Sync Error:", error)
        return NextResponse.json({ error: "Failed to sync device session" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (!deviceId) return NextResponse.json({ error: "No device ID" }, { status: 404 })

        // First, check if there's a user session for this device
        const currentSession = await prisma.deviceSession.findUnique({
            where: { deviceId }
        })

        // If this device is associated with a user, try to find their most recent data across any device
        if (currentSession?.userId) {
            const userSession = await prisma.deviceSession.findFirst({
                where: { userId: currentSession.userId },
                orderBy: { updatedAt: 'desc' }
            })
            if (userSession) {
                return NextResponse.json({
                    cart: JSON.parse(userSession.cart || "[]"),
                    viewed: JSON.parse(userSession.viewed || "[]"),
                    flashSale: JSON.parse(userSession.flashSale || "[]"),
                    tradeIns: JSON.parse(userSession.tradeIns || "[]")
                })
            }
        }

        if (!currentSession) return NextResponse.json({ error: "No session found" }, { status: 404 })

        return NextResponse.json({
            cart: JSON.parse(currentSession.cart || "[]"),
            viewed: JSON.parse(currentSession.viewed || "[]"),
            flashSale: JSON.parse(currentSession.flashSale || "[]"),
            tradeIns: JSON.parse(currentSession.tradeIns || "[]")
        })

    } catch (error) {
        console.error("Session Sync GET Error:", error)
        return NextResponse.json({ error: "Sync error" }, { status: 500 })
    }
}
