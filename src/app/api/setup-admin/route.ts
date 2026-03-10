import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const email = "admin@smarthub.com"
        const password = "SmartHub2026!"

        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                role: "ADMIN",
                displayName: "Master Admin Officer",
                password: password // In development, keeping it simple
            },
            create: {
                email: email,
                role: "ADMIN",
                displayName: "Master Admin Officer",
                password: password
            }
        })

        return NextResponse.json({
            success: true,
            message: "Master Admin Identity Initialized in Postgres",
            credentials: { email, password }
        })
    } catch (error: any) {
        console.error("Setup Admin Error:", error)
        let message = error.message || "Protocol Initialization Failed"
        if (message.includes("Tenant or user not found")) {
            message = "DATABASE_ERROR: Your Supabase project appears to be PAUSED. Please log in to the Supabase dashboard and RESUME it."
        }
        return NextResponse.json({
            success: false,
            error: message
        }, { status: 500 })
    }
}
