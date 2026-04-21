import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModernToaster } from "@/components/shared/ModernToaster";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { SessionSyncProvider } from "@/components/shared/SessionSyncProvider";

export const metadata: Metadata = {
  title: {
    default: "SmartHub Electronics",
    template: "%s | SmartHub Electronics"
  },
  description: "Secure, scalable eCommerce platform for the latest smartphones and certified refurbished electronics.",
  icons: {
    icon: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Simplified head - letting suppressHydrationWarning do its job naturally */}
      </head>
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
