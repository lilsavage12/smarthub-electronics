import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Shopping Cart",
    description: "Review your items and prepare for checkout."
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
