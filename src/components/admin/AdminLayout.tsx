"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard, ShoppingCart, Smartphone, Tags,
    Package, Users, Truck, CreditCard, ShieldCheck,
    Percent, BarChart3, FileText, Settings,
    ChevronLeft, ChevronRight, Bell, Search,
    MessageSquare, Plus, User, LogOut, Shield, Menu, X, Zap, RefreshCcw,
    Circle, ChevronUp, Activity
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { toast } from "react-hot-toast"

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
    const [user, setUser] = useState<any>(null)
    const pathname = usePathname()
    const router = useRouter()

    const [notifications, setNotifications] = useState([
        { id: 1, title: "Critical Stock Alert", message: "Lumina ZX inventory below 5 units.", time: "2m ago", type: "alert", read: false },
        { id: 2, title: "New Corporate Order", message: "Apex Corp requested 15x Aurora units.", time: "15m ago", type: "order", read: false },
        { id: 3, title: "System Sync Complete", message: "Global hardware registry updated.", time: "1h ago", type: "system", read: false },
    ])

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        toast.success("All notifications protocolled")
    }

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    useEffect(() => {
        const saved = localStorage.getItem("adminSidebarCollapsed")
        if (saved !== null) setIsSidebarCollapsed(saved === "true")
    }, [])

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed
        setIsSidebarCollapsed(newState)
        localStorage.setItem("adminSidebarCollapsed", String(newState))
    }

    useEffect(() => {
        // Simple session check using localStorage
        // TEMPORARY BYPASS: Auto-authorize every request for direct hub access
        const checkAuth = () => {
            const savedUser = localStorage.getItem("sh_admin_user")
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser)
                    setUser(userData)
                } catch (e) {
                    console.error("Session Parse Error", e)
                }
            }

            // If no user found, set a default temporary identity
            if (!user) {
                setUser({
                    displayName: "Guest Architect",
                    role: "OVERRIDE",
                    email: "architect@smarthub.internal"
                })
            }

            setIsAuthorized(true)
        }

        checkAuth()
    }, [pathname, router])

    const handleLogout = () => {
        localStorage.removeItem("sh_admin_user")
        setIsAuthorized(false)
        setUser(null)
        toast.success("Identity Protocol Terminated")
        router.push("/hub-control/login")
    }

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <Zap className="w-12 h-12 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Loading Admin Panel...</span>
                </div>
            </div>
        )
    }

    if (pathname === "/hub-control/login" || pathname.startsWith("/hub-control/invite")) {
        return <>{children}</>
    }

    const menuItems = [
        {
            group: "Operations", items: [
                { name: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, href: "/hub-control" },
                { name: "Orders", icon: <ShoppingCart className="w-[18px] h-[18px]" />, href: "/hub-control/orders" },
                { name: "Inventory", icon: <Package className="w-[18px] h-[18px]" />, href: "/hub-control/inventory" },
                { name: "Shipping", icon: <Truck className="w-[18px] h-[18px]" />, href: "/hub-control/supply" },
            ]
        },
        {
            group: "Products", items: [
                { name: "Products", icon: <Smartphone className="w-[18px] h-[18px]" />, href: "/hub-control/products" },
                { name: "Categories", icon: <Tags className="w-[18px] h-[18px]" />, href: "/hub-control/categories" },
                { name: "Discounts", icon: <Percent className="w-[18px] h-[18px]" />, href: "/hub-control/discounts" },
            ]
        },
        {
            group: "Settings", items: [
                { name: "Audit Logs", icon: <Activity className="w-[18px] h-[18px]" />, href: "/hub-control/audit" },
                { name: "Data Sync", icon: <RefreshCcw className="w-[18px] h-[18px]" />, href: "/hub-control/sync" },
                { name: "Security", icon: <Shield className="w-[18px] h-[18px]" />, href: "/hub-control/security" },
                { name: "Settings", icon: <Settings className="w-[18px] h-[18px]" />, href: "/hub-control/settings" },
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background flex text-foreground font-inter">
            {/* Mobile Sidebar Portal */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-[101] lg:hidden flex flex-col p-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                                        <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                                    </div>
                                    <span className="font-black text-sm tracking-widest uppercase italic">SmartHub</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className="rounded-xl"
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            <nav className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6">
                                {menuItems.map((group, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-4 italic px-2">{group.group}</span>
                                        <div className="flex flex-col gap-1">
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setIsMobileSidebarOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-4 py-3.5 px-5 rounded-2xl transition-all",
                                                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                        )}
                                                    >
                                                        {item.icon}
                                                        <span className="text-[10px] font-black uppercase tracking-widest translate-y-[1px]">{item.name}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </nav>

                            <div className="pt-6 border-t border-border mt-auto">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 py-4 px-6 rounded-2xl bg-red-500/5 text-red-500 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-500/10"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Seamless Dashboard Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col bg-card border-r border-border fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "w-20" : "w-72"
                )}
            >
                {/* Header: Brand Identity */}
                <div className="h-24 flex items-center shrink-0 justify-center">
                    <div className={cn("flex items-center gap-4 transition-all px-6 w-full", isSidebarCollapsed && "px-0 justify-center")}>
                        <div className="p-2.5 rounded-2xl bg-primary shadow-lg shadow-primary/20 shrink-0">
                            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-black text-xs tracking-[0.2em] uppercase italic text-foreground leading-none">SmartHub</span>
                                <span className="text-[10px] font-bold uppercase tracking-tighter text-primary mt-1">Command Centre</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Fluid Navigation */}
                <nav className="flex-1 overflow-y-auto no-scrollbar py-6 flex flex-col gap-6">
                    {menuItems.map((group, idx) => (
                        <div key={idx} className="flex flex-col">
                            {!isSidebarCollapsed && (
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 px-8 mb-4 italic">{group.group}</span>
                            )}
                            <div className="flex flex-col gap-1 px-3">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                                                isSidebarCollapsed ? "justify-center px-0" : "px-5",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                            title={isSidebarCollapsed ? item.name : undefined}
                                        >
                                            <span className={cn("transition-all duration-200 shrink-0", isActive ? "scale-110" : "group-hover:scale-110")}>
                                                {item.icon}
                                            </span>
                                            {!isSidebarCollapsed && (
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none translate-y-[1px] truncate">{item.name}</span>
                                            )}
                                            {isActive && (
                                                <div className={cn(
                                                    "absolute bg-primary transition-all duration-300",
                                                    isSidebarCollapsed
                                                        ? "w-1 h-6 left-0 rounded-r-full"
                                                        : "w-1 h-6 left-0 rounded-r-full"
                                                )} />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                            {idx < menuItems.length - 1 && !isSidebarCollapsed && (
                                <div className="mx-8 mt-6 border-b border-border/40" />
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer: Operative Profile */}
                <div className="p-4 flex flex-col gap-3 bg-muted/5 border-t border-border mt-auto">
                    <div
                        className={cn(
                            "flex items-center gap-4 p-2 rounded-2xl transition-all",
                            isSidebarCollapsed ? "justify-center" : "bg-card border border-border px-3 py-2.5 group cursor-pointer hover:border-primary/30"
                        )}
                    >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-muted border border-border flex items-center justify-center text-primary overflow-hidden transition-all group-hover:bg-primary/5">
                            {user?.photoURL ? <img src={user.photoURL} alt="A" className="w-full h-full object-cover" /> : <User size={18} />}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-[10px] font-black text-foreground tracking-tight uppercase truncate">{user?.displayName || "System Admin"}</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-primary/80 leading-none mt-1">{user?.role || "ADMIN"}</span>
                            </div>
                        )}
                    </div>

                    <div className={cn("flex gap-2", isSidebarCollapsed && "flex-col")}>
                        <button
                            onClick={toggleSidebar}
                            className="flex-1 flex items-center justify-center h-11 rounded-[14px] bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            title={isSidebarCollapsed ? "Expand" : "Collapse"}
                        >
                            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center h-11 rounded-[14px] bg-card border border-border text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-300",
                    isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
                )}
            >
                {/* Global Command Bar */}
                <header className="h-16 lg:h-20 bg-background/60 backdrop-blur-xl border-b border-border sticky top-0 z-40 flex items-center justify-between px-4 lg:px-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-3 rounded-xl bg-muted text-foreground"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative group hidden sm:flex items-center">
                            <Search className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search products, orders, customers..."
                                className="h-10 lg:h-11 bg-muted/40 border-none rounded-2xl py-2 pl-12 pr-6 text-[11px] w-64 lg:w-96 font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none text-foreground placeholder:text-muted-foreground/30 italic"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={cn(
                                    "relative p-3 rounded-2xl transition-all border",
                                    isNotificationsOpen ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/40 text-muted-foreground border-transparent hover:border-border hover:bg-muted"
                                )}
                            >
                                <Bell size={18} />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-96 bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">System Logs</h3>
                                                <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline">Mark all read</button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                                {notifications.map((n) => (
                                                    <div key={n.id} onClick={() => markAsRead(n.id)} className={cn("p-5 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group", !n.read && "bg-primary/[0.02]")}>
                                                        <div className="flex items-start gap-4">
                                                            <div className={cn(
                                                                "p-2 rounded-xl shrink-0",
                                                                n.type === 'alert' ? "bg-red-500/10 text-red-500" :
                                                                    n.type === 'order' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                                                                !n.read && "ring-1 ring-inset ring-current/20"
                                                            )}>
                                                                {n.type === 'alert' ? <ShieldCheck size={16} /> :
                                                                    n.type === 'order' ? <ShoppingCart size={16} /> : <FileText size={16} />}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-[11px] font-black uppercase tracking-tight leading-none">{n.title}</h4>
                                                                    {!n.read && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                                                </div>
                                                                <p className="text-[11px] font-medium text-muted-foreground leading-tight mt-1">{n.message}</p>
                                                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-1">{n.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-muted/10 border-t border-border">
                                                <Button
                                                    onClick={() => router.push("/hub-control/audit")}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl"
                                                >
                                                    View Internal Audit
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="h-6 w-[1px] bg-border mx-2" />
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-2xl border border-border">
                            <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">System Online</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-12 overflow-x-hidden no-scrollbar">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
