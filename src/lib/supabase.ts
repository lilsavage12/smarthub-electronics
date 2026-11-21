import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnsjeuzwwjpympzhcuol.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2pldXp3d2pweW1wemhjdW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODQ5MDksImV4cCI6MjA4ODk2MDkwOX0.Cy9aiA4Z2Fd_rZQHz5Bela3LN7qpWc8QMITsAz1Kvl4'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (can bypass RLS)
// Note: Requires SUPABASE_SERVICE_ROLE_KEY in .env
export const supabaseAdmin = typeof window === 'undefined' 
    ? createClient(supabaseUrl, serviceRoleKey)
    : supabase;
