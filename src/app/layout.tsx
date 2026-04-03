import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModernToaster } from "@/components/shared/ModernToaster";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { SessionSyncProvider } from "@/components/shared/SessionSyncProvider";
import { supabaseAdmin } from "@/lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await supabaseAdmin
    .from('HomepageSettings')
    .select('*')
    .eq('id', 'singleton')
    .maybeSingle();

  const storeName = settings?.storeName || "SmartHub Electronics";
  const logoUrl = settings?.logoUrl || "/favicon.ico";

  return {
    title: `${storeName} | Premium Electronics`,
    description: "Secure, scalable eCommerce platform for the latest smartphones and certified refurbished electronics.",
    icons: {
      icon: logoUrl,
      apple: logoUrl,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            <SessionSyncProvider>
              <div suppressHydrationWarning className="flex flex-col min-h-screen">
                {children}
              </div>
              <div suppressHydrationWarning>
                <ModernToaster />
              </div>
            </SessionSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
