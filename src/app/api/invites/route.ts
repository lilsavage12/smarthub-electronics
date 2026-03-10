import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const invites = await prisma.invite.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(invites)
    } catch (error) {
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const invite = await prisma.invite.create({
            data: body
        })
        return NextResponse.json(invite)
    } catch (error) {
        return NextResponse.json({ error: "Create failed" }, { status: 500 })
    }
}
