import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "DELIVERY & LOGISTICS | F1GEAR KE",
    description: "Countrywide delivery across Kenya for Formula One inspired streetwear."
}

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-[#0c0c0e] text-white py-16 px-6 md:px-12">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-3 border-b border-white/5 pb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e10600]">
                        LOGISTICS & FULFILLMENT
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                        DELIVERED COUNTRYWIDE
                    </h1>
                </div>

                <div className="space-y-8 text-xs text-white/60 leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">1. Coverage</h2>
                        <p>
                            We deliver to Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika and every town in Kenya through our network of motorbike riders and verified parcel couriers.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">2. Delivery Methods & Timelines</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-white">Motorbike Rider:</strong> Same-day delivery within Nairobi and neighbouring areas.</li>
                            <li><strong className="text-white">Courier / Parcel Service:</strong> Upcountry delivery across Kenya, usually arriving within 1 to 3 business days.</li>
                            <li><strong className="text-white">Shop Pick Up:</strong> Available in Nairobi by arrangement via WhatsApp.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">3. Payment & Dispatch</h2>
                        <p>
                            All orders are settled securely via M-Pesa. Once your order is placed, we verify item availability, quote the delivery fee on WhatsApp, and provide the M-Pesa payment number before dispatching your package.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
