import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { items, ...orderData } = body

        // Generate a unique order number
        const orderNumber = `SH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`

        const order = await prisma.order.create({
            data: {
                ...orderData,
                orderNumber,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image
                    }))
                }
            },
            include: {
                items: true
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Order Creation Error:", error)
        return NextResponse.json({ error: "Failed to process order" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}
