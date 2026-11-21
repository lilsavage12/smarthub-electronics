import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 600

export default async function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: settings } = await supabaseAdmin
        .from('HomepageSettings')
        .select('*')
        .eq('id', 'singleton')
        .maybeSingle()

    return (
        <div className="relative flex min-h-screen flex-col bg-[#0c0c0e] text-white" suppressHydrationWarning>
            <Navbar initialSettings={settings} />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <footer className="mt-auto">
                <Footer initialSettings={settings} />
            </footer>
            <CartDrawer />
        </div>
    );
}
