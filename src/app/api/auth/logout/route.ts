import { NextResponse } from "next/server"

export async function POST() {
    const response = NextResponse.json({ success: true })
    
    // Clear the auth cookie
    response.cookies.delete('sb-access-token')
    
    return response
}
