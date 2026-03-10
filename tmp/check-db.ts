import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const testConnection = async (url: string, name: string) => {
    console.log(`Testing ${name}...`)
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })
    try {
        await prisma.$connect()
        console.log(`✅ ${name} Success!`)
        return true
    } catch (e: any) {
        console.error(`❌ ${name} Failed: ${e.message}`)
        return false
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

const run = async () => {
    const urls = [
        { name: "Current Pooler URL", url: "postgresql://postgres.pzkoaidtfkmjjinknbil:WBWPgz05ztktz2iY@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true" },
        { name: "Direct URL (Possible)", url: "postgresql://postgres:WBWPgz05ztktz2iY@db.pzkoaidtfkmjjinknbil.supabase.co:5432/postgres" },
        { name: "Pooler Session Mode (5432)", url: "postgresql://postgres.pzkoaidtfkmjjinknbil:WBWPgz05ztktz2iY@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" }
    ]

    for (const item of urls) {
        await testConnection(item.url, item.name)
    }
}

run()
