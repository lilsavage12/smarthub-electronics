import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        })
        return NextResponse.json(logs)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const log = await prisma.auditLog.create({
            data: {
                ...body,
                timestamp: new Date()
            }
        })
        return NextResponse.json(log)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 })
    }
}
