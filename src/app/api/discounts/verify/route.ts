import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { code } = await req.json()

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 })
        }

        const discount = await prisma.discount.findUnique({
            where: { code }
        })

        if (!discount) {
            return NextResponse.json({ error: "Invalid discount code" }, { status: 404 })
        }

        if (discount.status !== "Active") {
            return NextResponse.json({ error: "This discount code is paused or inactive" }, { status: 400 })
        }

        if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
            return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 })
        }

        return NextResponse.json({
            message: "Promo code applied successfully",
            discount: {
                id: discount.id,
                code: discount.code,
                type: discount.type,
                value: discount.value
            }
        })

    } catch (error) {
        console.error("Discount Verification Error:", error)
        return NextResponse.json({ error: "Failed to verify discount" }, { status: 500 })
    }
}
