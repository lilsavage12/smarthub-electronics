import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const discount = await prisma.discount.update({
            where: { id },
            data: body
        })
        return NextResponse.json(discount)
    } catch (error) {
        console.error("Discount Update Error:", error)
        return NextResponse.json({ error: "Failed to update discount" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.discount.delete({
            where: { id }
        })
        return NextResponse.json({ message: "Discount deleted successfully" })
    } catch (error) {
        console.error("Discount Deletion Error:", error)
        return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 })
    }
}
