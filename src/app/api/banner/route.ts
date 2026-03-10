import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const banner = await prisma.banner.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" }
        })
        return NextResponse.json(banner || {})
    } catch (error) {
        console.error("Banner fetch error", error)
        return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const activeBanner = await prisma.banner.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" }
        })

        if (activeBanner) {
            const updated = await prisma.banner.update({
                where: { id: activeBanner.id },
                data: body
            })
            return NextResponse.json(updated)
        } else {
            const created = await prisma.banner.create({
                data: {
                    ...body,
                    isActive: true
                }
            })
            return NextResponse.json(created)
        }
    } catch (error) {
        console.error("Banner update error", error)
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
    }
}
