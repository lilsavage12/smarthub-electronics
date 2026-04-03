import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

export async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization')
    let user: any = null
    let diagnostics: any = { cookiesFound: 0, identityResolved: false, emailFound: null, sbStatus: 'N/A' }

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
            const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)
            user = authUser || null
            if (user) diagnostics.identityResolved = true;
        } catch (e: any) {
            console.log("verifyAdmin: getUser exception from header:", e.message)
        }
    } else {
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        diagnostics.cookiesFound = allCookies.length
        
        // Enhanced Token Resolution Logic
        // 1. Check for manual single token override
        const singleToken = allCookies.find(c => c.name === 'sb-access-token')?.value
        
        let token = ''
        if (singleToken) {
            token = singleToken
        } else {
            // 2. Fallback to chunked Supabase tokens (sb-xxx-auth-token.0, .1)
            const chunkedTokens = allCookies
                .filter(c => c.name.includes('auth-token'))
                .sort((a, b) => {
                    const aIdx = parseInt(a.name.split('.').pop() || '0')
                    const bIdx = parseInt(b.name.split('.').pop() || '0')
                    return (isNaN(aIdx) ? 0 : aIdx) - (isNaN(bIdx) ? 0 : bIdx)
                })
            token = chunkedTokens.map(c => c.value).join('')
        }
        
        if (token) {
            try {
                const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)
                user = authUser || null
                if (user) diagnostics.identityResolved = true;
                else diagnostics.sbStatus = error?.message || 'Token verification yielded no user'
            } catch (e: any) {
                diagnostics.sbStatus = `Exception: ${e.message}`
            }
        } else {
            diagnostics.sbStatus = 'No recognized auth tokens in request stream'
        }
    }

    // MISSION CRITICAL: Owner Bypass (Must execute even if user resolution was partial)
    if (user?.email === 'lilsavage12@gmail.com' || user?.email === '21@gmail.com' || diagnostics.identityResolved && !user?.email) {
        console.log(`[AUTH] Admin Authority granted to: ${user?.email || 'Authenticated User'}`)
        return true
    }

    if (!user) {
        (req as any).authDiagnostics = diagnostics;
        return false
    }

    diagnostics.emailFound = user.email
    console.log(`[VERIFY_ADMIN] Identity Resolved: ${user.email || 'NONE'}`)

    // ULTIMATE NEUTRALIZER: Hardcoded Owner Bypass
    if (user.email === 'lilsavage12@gmail.com' || user.email === '21@gmail.com') {
        console.log(`[AUTH] Admin bypass granted for: ${user.email}`)
        return true
    }

    if (user.email) {
        const { data: userByEmail } = await supabaseAdmin.from('User').select('role').eq('email', user.email).maybeSingle()
        diagnostics.sbStatus = userByEmail ? `Found (Role: ${userByEmail.role})` : 'Not Found'
        if (userByEmail && (userByEmail.role === 'ADMIN' || userByEmail.role === 'SUPER_ADMIN')) {
            console.log(`[AUTH] Admin verified via Supabase: ${user.email}`)
            return true
        }
    }

    (req as any).authDiagnostics = diagnostics;
    return false
}

export async function getAuthUser(req: Request) {
    const authHeader = req.headers.get('Authorization')
    const cookieStore = await cookies()
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined

    if (!token) {
        const allCookies = cookieStore.getAll()
        const singleToken = allCookies.find(c => c.name === 'sb-access-token')?.value
        
        if (singleToken) {
            token = singleToken
        } else {
            const chunkedTokens = allCookies
                .filter(c => c.name.includes('auth-token'))
                .sort((a, b) => {
                    const aIdx = parseInt(a.name.split('.').pop() || '0')
                    const bIdx = parseInt(b.name.split('.').pop() || '0')
                    return (isNaN(aIdx) ? 0 : aIdx) - (isNaN(bIdx) ? 0 : bIdx)
                })
            token = chunkedTokens.map(c => c.value).join('')
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

