import { Client } from 'pg'

const projectRef = 'pzkoaidtfkmjjinknbil'
const password = 'WBWPgz05ztktz2iY'

const regions = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'eu-central-1',
    'eu-central-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-south-1',
    'sa-east-1',
    'ca-central-1'
]

async function run() {
    for (const region of regions) {
        const url = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`
        console.log(`Trying ${region}...`)
        const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 })
        try {
            await client.connect()
            const res = await client.query('SELECT 1 as result')
            console.log(`✅ SUCCESS! Found correct region: ${region}`)
            console.log(`Working connection string: ${url}`)
            await client.end()
            return region
        } catch (e: any) {
            console.log(`  Failed: ${e.message}`)
            try { await client.end() } catch { }
        }
    }
}

run()
