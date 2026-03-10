import { Client } from 'pg'

const projectRef = 'pzkoaidtfkmjjinknbil'
const password = 'WBWPgz05ztktz2iY'

const tests = [
    {
        name: "Pooler (5432) + ProjectRef User",
        url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
    },
    {
        name: "Pooler (6543) + ProjectRef User",
        url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
    },
    {
        name: "Direct Host (5432) + Simple User",
        url: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`
    },
    {
        name: "Direct Host (5432) + ProjectRef User",
        url: `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`
    }
]

async function run() {
    for (const test of tests) {
        console.log(`--- Testing: ${test.name} ---`)
        const client = new Client({ connectionString: test.url, connectionTimeoutMillis: 5000 })
        try {
            await client.connect()
            const res = await client.query('SELECT 1 as result')
            console.log(`✅ SUCCESS! Connection verified.`)
            await client.end()
            break // Stop if we find one that works
        } catch (e: any) {
            console.error(`❌ FAILED: ${e.message}`)
            try { await client.end() } catch { }
        }
    }
}

run()
