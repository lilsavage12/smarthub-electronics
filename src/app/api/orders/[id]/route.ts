import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: body,
            include: { items: true }
        })

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error("Order Update Error:", error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.order.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Order deleted successfully" })
    } catch (error) {
        console.error("Order Deletion Error:", error)
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
    }
}
