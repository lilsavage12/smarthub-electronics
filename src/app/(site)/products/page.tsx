import { Suspense } from "react"
import { Smartphone } from "lucide-react"
import ProductsClient from "./ProductsClient"

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Smartphone className="animate-pulse text-primary" /></div>}>
            <ProductsClient />
        </Suspense>
    )
}
