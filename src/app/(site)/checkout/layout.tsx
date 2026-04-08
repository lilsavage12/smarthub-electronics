import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Secure Checkout",
    description: "Complete your order with our secure checkout process."
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
