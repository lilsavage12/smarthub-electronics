import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    try {
        const reviews = await prisma.review.findMany({
            where: productId ? { productId } : {},
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(reviews)
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
