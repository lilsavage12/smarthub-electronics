import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, type, value, maxUses } = body

        const existing = await prisma.discount.findUnique({ where: { code } })
        if (existing) {
            return NextResponse.json({ error: "Code already exists" }, { status: 400 })
        }

        const discount = await prisma.discount.create({
            data: {
                code,
                type,
                value,
                maxUses: maxUses ? parseInt(maxUses) : null
            }
        })
        return NextResponse.json(discount)
    } catch (error: any) {
        console.error("Discount creation failed:", error)
        return NextResponse.json({ error: "Failed to create discount" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const discounts = await prisma.discount.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(discounts)
    } catch (error) {
        return NextResponse.json({ error: "Failed to load discounts" }, { status: 500 })
    }
}
