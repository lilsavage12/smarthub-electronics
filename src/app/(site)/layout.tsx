import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
            <Navbar />
            <main className="flex-1 pt-24 lg:pt-32 pb-24">
                {children}
            </main>
            <MobileBottomNav />
            <Footer />
        </div>
    );
}
