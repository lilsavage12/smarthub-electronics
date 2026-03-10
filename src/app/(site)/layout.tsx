import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionSyncProvider } from "@/components/shared/SessionSyncProvider";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionSyncProvider>
            <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </SessionSyncProvider>
    );
}
