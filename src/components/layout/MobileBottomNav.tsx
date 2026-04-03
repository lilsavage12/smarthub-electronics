"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    Home, Heart, Briefcase, Sun, Moon 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWishlist } from "@/lib/wishlist-store"
import { useTheme } from "next-themes"

export const MobileBottomNav = () => {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { items: wishlistItems } = useWishlist()
    
    // Safety check for next-themes
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    const wishlistCount = wishlistItems.length

    const navItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Shop", icon: Briefcase, href: "/products" },
        { name: "Wishlist", icon: Heart, href: "/wishlist", badge: wishlistCount },
        { 
            name: "Theme", 
            icon: theme === "light" ? Moon : Sun, 
            isToggle: true,
            onClick: () => setTheme(theme === "light" ? "dark" : "light") 
        },
    ]

    return (
        <div suppressHydrationWarning className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-2xl border-t border-border/50 px-6 py-2 pb-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            {navItems.map((item: any) => {
                const Icon = item.icon
                const isActive = item.href ? (pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))) : false
                
                const content = (
                    <div suppressHydrationWarning className={cn(
                        "flex flex-col items-center gap-1 group relative py-1",
                        isActive ? "text-primary" : "text-muted-foreground w-12"
                    )}>
                        <div suppressHydrationWarning className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            isActive ? "bg-primary/10" : "group-hover:bg-muted"
                        )}>
                            <Icon className={cn("w-5 h-5", isActive && "fill-primary/20", item.isToggle && "animate-in fade-in zoom-in duration-300 rotate-0 scale-100 transition-all")} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest italic">{item.name}</span>
                        
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-background shadow-lg scale-110">
                                {item.badge}
                            </span>
                        )}
                        
                        {isActive && (
                            <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                        )}
                    </div>
                )

                if (item.isToggle) {
                    return (
                        <button key={item.name} onClick={item.onClick} className="outline-none">
                            {content}
                        </button>
                    )
                }

                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        className="outline-none"
                    >
                        {content}
                    </Link>
                )
            })}
        </div>
    )
}
