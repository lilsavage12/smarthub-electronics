import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 600

export default async function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Fetch CMS Global data server-side (Shared between Navbar/Footer)
    // Using a cached fetch with next: { revalidate: 600 } is implicitly handled by the layout export
    const { data: settings } = await supabaseAdmin
        .from('HomepageSettings')
        .select('*')
        .eq('id', 'singleton')
        .maybeSingle()

    return (
        <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
            <Navbar initialSettings={settings} />
            <main className="flex-1 pt-24 lg:pt-32 pb-24">
                {children}
            </main>
            <MobileBottomNav />
            <footer className="mt-auto">
                <Footer initialSettings={settings} />
            </footer>
        </div>
    );
}
