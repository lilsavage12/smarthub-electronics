import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModernToaster } from "@/components/shared/ModernToaster";
import { Chatbot } from "@/components/shared/Chatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { SessionSyncProvider } from "@/components/shared/SessionSyncProvider";

export const metadata: Metadata = {
  title: "SmartHub Electronics | Premium Smartphone Retail",
  description: "Secure, scalable eCommerce platform for the latest smartphones and certified refurbished electronics.",
};

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
            {children}
            <div suppressHydrationWarning>
              <ModernToaster />
            </div>
          </SessionSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
