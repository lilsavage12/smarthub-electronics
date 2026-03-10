import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    try {
        if (productId) {
            const reviews = await prisma.review.findMany({
                where: { productId },
                orderBy: { createdAt: "desc" }
            })
            return NextResponse.json(reviews)
        }
        return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const review = await prisma.review.create({
            data: body
        })
        return NextResponse.json(review)
    } catch (error) {
        return NextResponse.json({ error: "Create failed" }, { status: 500 })
    }
}
