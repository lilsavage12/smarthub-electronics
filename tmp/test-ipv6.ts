import { Client } from 'pg'

const password = 'WBWPgz05ztktz2iY'
const ipv6 = '2a05:d012:42e:570a:78f9:1a83:bc67:9537'
const url = `postgresql://postgres:${password}@[${ipv6}]:5432/postgres`

async function run() {
    console.log(`Trying ${url}...`)
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 })
    try {
        await client.connect()
        const res = await client.query('SELECT 1 as result')
        console.log(`✅ SUCCESS! Connection verified.`)
        await client.end()
    } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`)
        try { await client.end() } catch { }
    }
}

run()
