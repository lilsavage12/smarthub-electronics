import { Client } from 'pg'

const connectionString = "postgresql://postgres.pzkoaidtfkmjjinknbil:WBWPgz05ztktz2iY@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

async function run() {
    console.log("Connecting...")
    const client = new Client({ connectionString })
    try {
        await client.connect()
        const res = await client.query('SELECT NOW()')
        console.log("✅ Connection Success! Server time:", res.rows[0].now)
    } catch (e: any) {
        console.error("❌ Connection Failed:", e.message)
    } finally {
        await client.end()
    }
}

run()
