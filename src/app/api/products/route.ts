import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { variants: true }
        })
        return NextResponse.json(products)
    } catch (error) {
        console.error("Database Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id, variants, ...rest } = body
        const payload = {
            ...rest,
            specs: rest.specs ? JSON.stringify(rest.specs) : null,
            variants: {
                create: variants ? variants.map((v: any) => ({
                    color: v.color,
                    stock: v.stock,
                    price: v.price,
                    images: JSON.stringify(v.images || [])
                })) : []
            }
        }

        const product = await prisma.product.create({
            data: payload
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error("Database Create Error:", error)
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }
}
