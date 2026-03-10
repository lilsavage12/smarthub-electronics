import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL || "";

console.log("--- PRISMA DEBUG ---");
console.log(`Connection URL (Masked): ${connectionString.replace(/:[^:@]+@/, ":****@")}`);
console.log(`URL chars (hex): ${Buffer.from(connectionString).toString('hex')}`);

const pool = new Pool({
    connectionString,
    max: 1 // Keep pool small for debugging
})

const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

const test = async () => {
    try {
        await prisma.$connect()
        console.log("✅ Connect success");
    } catch (e: any) {
        console.error("❌ Connect fail:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
