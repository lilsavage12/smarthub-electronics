import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModernToaster } from "@/components/shared/ModernToaster";
import { SessionSyncProvider } from "@/components/shared/SessionSyncProvider";

export const metadata: Metadata = {
  title: {
    default: "F1GEAR | KE — Paddock Precision Streetwear",
    template: "%s | F1GEAR KE"
  },
  description: "Formula One inspired gear, built for the paddock and the city. Premium jackets, shirts and polos delivered anywhere in Kenya.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans antialiased min-h-screen bg-background text-foreground dark"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
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
