import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { prisma } from "@/lib/prisma"
import { collection, getDocs } from "firebase/firestore"

export async function GET() {
    const results = {
        products: 0,
        users: 0,
        errors: [] as string[]
    }

    try {
        // 1. Migrate Products
        try {
            const productsSnapshot = await getDocs(collection(db, "products"))
            for (const doc of productsSnapshot.docs) {
                const data = doc.data()
                await prisma.product.upsert({
                    where: { id: doc.id },
                    update: {
                        name: data.name || "Untitled Product",
                        description: data.description || "",
                        price: Number(data.price) || 0,
                        image: data.image || "",
                        category: data.category || "General",
                        brand: data.brand || "Generic",
                        stock: Number(data.stock) || 0,
                        specs: data.specs ? JSON.stringify(data.specs) : null,
                    },
                    create: {
                        id: doc.id,
                        name: data.name || "Untitled Product",
                        description: data.description || "",
                        price: Number(data.price) || 0,
                        image: data.image || "",
                        category: data.category || "General",
                        brand: data.brand || "Generic",
                        stock: Number(data.stock) || 0,
                        specs: data.specs ? JSON.stringify(data.specs) : null,
                    }
                })
                results.products++
            }
        } catch (err: any) {
            results.errors.push(`Products Migration Error: ${err.message}`)
        }

        // 2. Migrate Users
        try {
            const usersSnapshot = await getDocs(collection(db, "users"))
            for (const doc of usersSnapshot.docs) {
                const data = doc.data()
                await prisma.user.upsert({
                    where: { email: data.email },
                    update: {
                        role: data.role || "USER",
                        displayName: data.displayName || null,
                    },
                    create: {
                        id: doc.id,
                        email: data.email,
                        role: data.role || "USER",
                        displayName: data.displayName || null,
                    }
                })
                results.users++
            }
        } catch (err: any) {
            results.errors.push(`Users Migration Error: ${err.message}`)
        }

        return NextResponse.json({
            success: results.errors.length === 0,
            results,
            message: results.errors.length === 0 ? "Migration completed successfully" : "Migration completed with errors"
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
