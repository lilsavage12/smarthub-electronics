"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard, Package, Heart, MapPin, Settings,
    LogOut, Menu, X, User, ChevronRight, ShoppingBag, Zap
} from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview" },
    { name: "My Orders", href: "/dashboard/orders", icon: Package, description: "Track orders" },
    { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart, description: "Saved items" },
    { name: "Addresses", href: "/dashboard/addresses", icon: MapPin, description: "Shipping" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, description: "Account" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success("Signed out successfully")
        router.push("/")
    }

    if (!user) {
        return null
    }

    const initials = (user.displayName || user.email || "U")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="min-h-screen bg-background mt-[80px]">
            <div className="flex">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed lg:sticky top-0 lg:top-[80px] left-0 z-50 h-screen lg:h-[calc(100vh-80px)] w-72 bg-card border-r border-border transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Profile Header */}
                    <div className="p-5 border-b border-border">
                        <div className="flex items-center justify-between mb-5 lg:hidden">
                            <span className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Menu</span>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-accent rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3.5 p-3.5 bg-accent/50 rounded-2xl border border-border/50">
                            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                    {user.displayName || "Customer"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Menu
                        </p>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                        isActive ? "bg-primary-foreground/15" : "bg-muted group-hover:bg-background"
                                    )}>
                                        <item.icon className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block leading-tight">{item.name}</span>
                                        {!isActive && (
                                            <span className="text-[10px] text-muted-foreground/60 leading-tight">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-border space-y-1">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-muted group-hover:bg-background flex items-center justify-center transition-colors">
                                <ShoppingBag className="w-[18px] h-[18px]" />
                            </div>
                            Continue Shopping
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-red-500/10 group-hover:bg-red-500/15 flex items-center justify-center transition-colors">
                                <LogOut className="w-[18px] h-[18px]" />
                            </div>
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-[80px] z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2.5 hover:bg-accent rounded-xl transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <h1 className="text-sm font-bold tracking-wide">My Account</h1>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                                {initials}
                            </div>
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-5 lg:p-8 max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
