import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, subject, message } = body

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
        }

        // Create contact message in registry
        const { data: newMessage, error } = await supabaseAdmin
            .from('ContactMessage')
            .insert({
                name,
                email,
                subject,
                message,
                status: "UNREAD",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ 
            message: "Your message has been sent successfully!",
            id: newMessage.id 
        }, { status: 201 })

    } catch (error: any) {
        console.error("Supabase Contact Form Intake Error:", error)
        return NextResponse.json({ error: "Could not send message. Please try again." }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status")
        const email = searchParams.get("email")

        let query = supabaseAdmin
            .from('ContactMessage')
            .select('*')
            .order('createdAt', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }
        if (email) {
            query = query.ilike('email', `%${email}%`)
        }

        const { data: messages, error } = await query

        if (error) throw error

        return NextResponse.json(messages)
    } catch (error: any) {
        console.error("Supabase Contact Message Fetch Error:", error)
        return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
    }
}

