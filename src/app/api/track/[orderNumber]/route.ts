import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, context: { params: Promise<{ orderNumber: string }> }) {
    try {
        const { orderNumber } = await context.params

        if (!orderNumber) {
            return NextResponse.json({ error: "Order number is required" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({
            where: { orderNumber: orderNumber.toUpperCase() },
            include: { items: true }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        return NextResponse.json(order)

    } catch (error) {
        console.error("Order Tracking Error:", error)
        return NextResponse.json({ error: "Failed to fetch order tracking info" }, { status: 500 })
    }
}
