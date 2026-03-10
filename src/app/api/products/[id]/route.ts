import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: id },
            include: { variants: true }
        })

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("Database Fetch error:", error)
        return NextResponse.json({ error: "Database failure" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json()
        const { id: bodyId, variants, ...rest } = body
        const payload = {
            ...rest,
            specs: rest.specs ? JSON.stringify(rest.specs) : undefined
        }

        await prisma.product.update({
            where: { id: id },
            data: {
                ...payload,
                variants: {
                    deleteMany: {},
                    create: variants ? variants.map((v: any) => ({
                        color: v.color,
                        stock: v.stock,
                        price: v.price,
                        images: JSON.stringify(v.images || [])
                    })) : []
                }
            }
        })

        return NextResponse.json({ message: "Product record updated" })
    } catch (error) {
        console.error("Database Update error:", error)
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.product.delete({
            where: { id: id }
        })
        return NextResponse.json({ message: "Product deleted" })
    } catch (error) {
        console.error("Database Deletion error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
