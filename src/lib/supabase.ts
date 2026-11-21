import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (can bypass RLS)
// Note: Requires SUPABASE_SERVICE_ROLE_KEY in .env
export const supabaseAdmin = typeof window === 'undefined' 
    ? createClient(supabaseUrl, serviceRoleKey)
    : supabase;
