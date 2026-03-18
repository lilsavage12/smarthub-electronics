import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

export async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization')
    let user: any = null

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
            const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)
            user = authUser || null
        } catch (e: any) {
            console.log("verifyAdmin: getUser exception from header:", e.message)
        }
    } else {
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        let token: string | undefined
        
        // Find all cookies related to auth
        const authCookies = allCookies.filter(c => c.name.includes('auth-token') || c.name.includes('access-token'))
        
        if (authCookies.length > 0) {
            // Sort by index if they are chunked (.0, .1, etc)
            authCookies.sort((a, b) => {
                const aIdx = parseInt(a.name.split('.').pop() || '0')
                const bIdx = parseInt(b.name.split('.').pop() || '0')
                return aIdx - bIdx
            })
            
            // Reconstruct token from chunks or just take the single one
            token = authCookies.map(c => c.value).join('')
        }
        
        if (token) {
            try {
                const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)
                user = authUser || null
                if (error) console.log("verifyAdmin: getUser error:", error.message)
            } catch (e: any) {
                console.log("verifyAdmin: getUser exception from cookie:", e.message)
            }
        } else {
            console.log("verifyAdmin: No auth token found in cookies or header")
        }
    }

    if (!user) {
        console.log("verifyAdmin: Auth failed - No user found")
        return false
    }

    if (!user.id && !user.email) {
        console.log("verifyAdmin: Auth failed - User missing ID and Email")
        return false
    }

    console.log("verifyAdmin: Authenticated user:", user.email || user.id)


    // 1. Primary Strategy: Match by authenticated ID (UUID)
    const { data: userByUUID } = await supabaseAdmin.from('User').select('role').eq('id', user.id).maybeSingle()
    if (userByUUID && (userByUUID.role === 'ADMIN' || userByUUID.role === 'SUPER_ADMIN')) {
        console.log("verifyAdmin: Authorized via primary UUID record")
        return true
    }

    // 2. Secondary Strategy: Identity Bridge via Email Migration
    if (user.email) {
        const { data: userByEmail } = await supabaseAdmin.from('User').select('id, role').eq('email', user.email).maybeSingle()
        if (userByEmail && (userByEmail.role === 'ADMIN' || userByEmail.role === 'SUPER_ADMIN')) {
            // Self-Healing: If we found an admin role on a legacy CUID email record, upgrade the UUID record
            if (userByEmail.id !== user.id) {
               console.log("verifyAdmin: Found legacy admin record, auto-scaling privileges to modernize session")
               await supabaseAdmin.from('User').update({ role: userByEmail.role }).eq('id', user.id)
            }
            console.log("verifyAdmin: Authorized via email-mapped secondary record")
            return true
        }

        // 3. Fallback: profiles table
        const { data: profileRecord } = await supabaseAdmin.from('profiles').select('role').eq('email', user.email).maybeSingle()
        if (profileRecord && (profileRecord.role === 'ADMIN' || profileRecord.role === 'SUPER_ADMIN')) {
            console.log("verifyAdmin: Authorized via profiles synchronization")
            return true
        }
    }

    console.log("verifyAdmin: Access DENIED for user", user.email || user.id)
    return false
}

export async function getAuthUser(req: Request) {
    const authHeader = req.headers.get('Authorization')
    const cookieStore = await cookies()
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined

    if (!token) {
        const allCookies = cookieStore.getAll()
        const authCookies = allCookies.filter(c => c.name.includes('auth-token') || c.name.includes('access-token'))
        
        if (authCookies.length > 0) {
            authCookies.sort((a, b) => {
                const aIdx = parseInt(a.name.split('.').pop() || '0')
                const bIdx = parseInt(b.name.split('.').pop() || '0')
                return aIdx - bIdx
            })
            token = authCookies.map(c => c.value).join('')
        }
    }

    if (!token) return null
    try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token)
        return user
    } catch (e) {
        return null
    }
}
