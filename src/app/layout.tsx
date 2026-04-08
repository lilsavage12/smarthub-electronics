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
        <Script
          id="hydration-suppress-logger"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // 1. SILENCE GLOBAL ERRORS
                  window.addEventListener('error', (e) => {
                    if (e.message && (e.message.includes('hydration') || e.message.includes('bis_skin_checked'))) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                    }
                  }, true);

                  // 2. Mute console errors
                  const originalError = console.error;
                  console.error = function(...args) {
                    if (typeof args[0] === 'string' && (
                      args[0].includes('bis_skin_checked') || 
                      args[0].includes('suppressHydrationWarning') ||
                      args[0].includes('hydration-mismatch')
                    )) {
                      return;
                    }
                    originalError.apply(console, args);
                  };

                  // 3. Aggressive attribute stripping
                  const targetAttrs = ['bis_skin_checked', 'data-ext-', 'data-newgr-'];
                  const cleanNodes = (nodes) => {
                    for (let i = 0; i < nodes.length; i++) {
                      const node = nodes[i];
                      if (node.nodeType === 1) { // ELEMENT_NODE
                        for (let j = 0; j < targetAttrs.length; j++) {
                          const attr = targetAttrs[j];
                          if (node.hasAttribute(attr)) node.removeAttribute(attr);
                          if (attr.endsWith('-')) {
                            const attrs = [...node.attributes];
                            for (let k = 0; k < attrs.length; k++) {
                              if (attrs[k].name.startsWith(attr)) node.removeAttribute(attrs[k].name);
                            }
                          }
                        }
                        if (node.childNodes.length > 0) cleanNodes(node.childNodes);
                      }
                    }
                  };

                  // Initial deep clean
                  cleanNodes([document.documentElement]);

                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      if (mutation.type === 'attributes') {
                        const name = mutation.attributeName;
                        if (name && (targetAttrs.includes(name) || targetAttrs.some(a => a.endsWith('-') && name.startsWith(a)))) {
                           mutation.target.removeAttribute(name);
                        }
                      }
                      if (mutation.type === 'childList') {
                        cleanNodes(mutation.addedNodes);
                      }
                    });
                  });

                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true
                  });
                }
              })();
            `
          }}
        />
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
