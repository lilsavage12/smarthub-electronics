import { Client } from 'pg'

const urls = [
    "postgresql://postgres.pzkoaidtfkmjjinknbil:WBWPgz05ztktz2iY@db.pzkoaidtfkmjjinknbil.supabase.co:5432/postgres",
    "postgresql://postgres:WBWPgz05ztktz2iY@db.pzkoaidtfkmjjinknbil.supabase.co:5432/postgres",
    "postgresql://postgres.pzkoaidtfkmjjinknbil:WBWPgz05ztktz2iY@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
]

async function run() {
    for (const url of urls) {
        console.log(`Checking ${url.split('@')[1]}...`)
        const client = new Client({ connectionString: url })
        try {
            await client.connect()
            const res = await client.query('SELECT 1 as result')
            console.log(`✅ SUCCESS!`)
        } catch (e: any) {
            console.error(`❌ FAILED: ${e.message}`)
        } finally {
            await client.end()
        }
    }
}

run()
