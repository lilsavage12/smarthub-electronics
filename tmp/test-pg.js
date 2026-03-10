const { Client } = require('pg');

const connectionString = "postgresql://postgres:WBWPgz05ztktz2iY@db.pzkoaidtfkmjjinknbil.supabase.co:5432/postgres";

async function testConnection() {
    const client = new Client({
        connectionString: connectionString,
    });
    try {
        console.log("Attempting to connect to Supabase Direct Host...");
        await client.connect();
        console.log("Successfully connected!");
        const res = await client.query('SELECT NOW()');
        console.log("Current time from DB:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("Connection error:", err.message);
    }
}

testConnection();
