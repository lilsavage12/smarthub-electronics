import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const { email, password, displayName } = await req.json()

        if (!email || !password || !displayName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName,
                role: "USER"
            }
        })

        const cookieStore = await cookies()
        const deviceId = cookieStore.get('deviceId')?.value

        if (deviceId) {
            const session = await prisma.deviceSession.findUnique({ where: { deviceId } })
            if (session) {
                await prisma.deviceSession.update({
                    where: { deviceId },
                    data: { userId: user.id }
                })
            } else {
                await prisma.deviceSession.create({
                    data: {
                        deviceId,
                        userId: user.id,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                })
            }
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                displayName: user.displayName
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
