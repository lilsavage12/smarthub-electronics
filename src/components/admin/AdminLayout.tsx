"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard, ShoppingCart, Smartphone, Tags,
    Package, Users, Truck, CreditCard, ShieldCheck,
    Percent, BarChart3, FileText, Settings,
    ChevronLeft, ChevronRight, Bell, Search,
    MessageSquare, Plus, User, LogOut, Shield, Menu, X, Zap, RefreshCcw,
    Circle, ChevronUp, Activity, Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-store"

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const { user: authUser, isInitialized, isRefreshing, logout: authLogout } = useAuth()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
    const [user, setUser] = useState<any>(null)
    const pathname = usePathname()
    const router = useRouter()

    const [notifications, setNotifications] = useState<any[]>([])
    const [lastOrderTimestamp, setLastOrderTimestamp] = useState<string | null>(null)
    const [cmsSettings, setCmsSettings] = useState<any>(null)
    const shownStockAlerts = React.useRef<Set<string>>(new Set())

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        toast.success("All notifications marked as read")
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
        const fetchCms = async () => {
            try {
                const res = await fetch("/api/cms/homepage")
                if (res.ok) {
                    const data = await res.json()
                    setCmsSettings(data.settings)
                }
            } catch (error) {
                console.error("Failed to fetch CMS settings:", error)
            }
        }
        fetchCms()
    }, [])

    const [unreadMessages, setUnreadMessages] = useState<number>(0)

    const fetchUnreadMessages = async () => {
        try {
            const res = await fetch("/api/contact?status=UNREAD")
            if (res.ok) {
                const data = await res.json()
                setUnreadMessages(data.length)
            }
        } catch (error) {
            console.error("Failed to fetch unread messages count:", error)
        }
    }

    // Real-time Notification Service
    useEffect(() => {
        if (!isAuthorized) return

        const pollNotifications = async () => {
            try {
                // Fetch unread messages for sidebar badge
                fetchUnreadMessages()
                const [ordersRes, productsRes] = await Promise.all([
                    fetch("/api/orders"),
                    fetch("/api/products")
                ])
                
                // ... rest of polling logic exists here

                if (ordersRes.ok) {
                    const orders = await ordersRes.json()
                    // Sort by date desc
                    const sortedOrders = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                    if (sortedOrders.length > 0) {
                        const latestOrder = sortedOrders[0]

                        // Check if this is a new order since we last polled
                        if (lastOrderTimestamp && new Date(latestOrder.createdAt) > new Date(lastOrderTimestamp)) {
                            toast.success(`NEW ORDER: KSh ${latestOrder.totalAmount} from ${latestOrder.customerName || 'Anonymous'}`, {
                                icon: '🛒',
                                duration: 5000,
                                position: 'top-right',
                                style: {
                                    background: '#0F0F12',
                                    color: '#fff',
                                    border: '1px solid #1A1A1D',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }
                            })

                            const newNotify = {
                                id: Date.now(),
                                title: "New Order Received",
                                message: `Order #${latestOrder.orderNumber || latestOrder.id.slice(-6)}: KSh ${latestOrder.totalAmount}`,
                                time: "Just now",
                                type: "order",
                                read: false
                            }
                            setNotifications(prev => [newNotify, ...prev].slice(0, 10))
                        }
                        setLastOrderTimestamp(latestOrder.createdAt)
                    }
                }

                if (productsRes.ok) {
                    const products = await productsRes.json()
                    const lowStock = products.filter((p: any) => p.stock < 10 && !shownStockAlerts.current.has(p.id))

                    lowStock.forEach((p: any) => {
                        toast.error(`LOW STOCK: ${p.name} (${p.stock} units remaining)`, {
                            icon: '⚠️',
                            duration: 6000,
                            position: 'top-right',
                            style: {
                                background: '#1A0000',
                                color: '#FF5555',
                                border: '1px solid #440000',
                                fontSize: '11px',
                                fontWeight: '900',
                            }
                        })

                        const newNotify = {
                            id: Date.now() + Math.random(),
                            title: "Low Stock Warning",
                            message: `${p.name} has only ${p.stock} units left.`,
                            time: "Just now",
                            type: "alert",
                            read: false
                        }
                        setNotifications(prev => [newNotify, ...prev].slice(0, 10))
                        shownStockAlerts.current.add(p.id)
                    })
                }
            } catch (err) {
                // Silently handle polling failures to avoid console noise during dev restarts
            }
        }

        // Initial fetch
        pollNotifications()
        const interval = setInterval(pollNotifications, 15000) // 15s polling for notification center
        return () => clearInterval(interval)
    }, [isAuthorized, lastOrderTimestamp])

    useEffect(() => {
        if (!isInitialized || isRefreshing) return

        if (authUser) {
            if (authUser.role === "ADMIN" || authUser.role === "SUPER_ADMIN") {
                setUser(authUser)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
                toast.error("Access Denied: Admin privileges required.")
                router.push("/")
            }
        } else {
            setIsAuthorized(false)
            if (pathname !== "/hub-control/login" && !pathname.startsWith("/hub-control/invite")) {
                router.push("/hub-control/login")
            }
        }
    }, [authUser, isInitialized, pathname, router])

    const handleLogout = async () => {
        await authLogout()
        localStorage.removeItem("sh_admin_user")
        setIsAuthorized(false)
        setUser(null)
        toast.success("Logged out successfully")
        router.push("/hub-control/login")
    }

    if (pathname === "/hub-control/login" || pathname.startsWith("/hub-control/invite")) {
        return <>{children}</>
    }

    if (isAuthorized === null || (!isInitialized || isRefreshing)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" suppressHydrationWarning>
                <div className="flex flex-col items-center gap-6 animate-pulse" suppressHydrationWarning>
                    <Zap className="w-12 h-12 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Loading Admin Panel...</span>
                </div>
            </div>
        )
    }

    const menuItems = [
        {
            group: "Operations", items: [
                { name: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, href: "/hub-control" },
                { name: "Orders", icon: <ShoppingCart className="w-[18px] h-[18px]" />, href: "/hub-control/orders" },
                { name: "Delivery Fee", icon: <Truck className="w-[18px] h-[18px]" />, href: "/hub-control/delivery" },
                { name: "Messages", icon: <MessageSquare className="w-[18px] h-[18px]" />, href: "/hub-control/messages", badge: unreadMessages > 0 ? unreadMessages : undefined },
                { name: "Storefront CMS", icon: <ImageIcon className="w-[18px] h-[18px]" />, href: "/hub-control/cms" },
            ]
        },
        {
            group: "Products", items: [
                { name: "Products", icon: <Smartphone className="w-[18px] h-[18px]" />, href: "/hub-control/products" },
                { name: "Discounts", icon: <Percent className="w-[18px] h-[18px]" />, href: "/hub-control/discounts" },
            ]
        },
        {
            group: "Settings", items: [
                { name: "Settings", icon: <Settings className="w-[18px] h-[18px]" />, href: "/hub-control/settings" },
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background flex text-foreground font-inter" suppressHydrationWarning>
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
                            className="fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-card border-r border-border z-[101] lg:hidden flex flex-col p-6 shadow-2xl"
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
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4 italic px-2">{group.group}</span>
                                        <div className="flex flex-col gap-1">
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setIsMobileSidebarOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-4 py-3.5 px-5 rounded-2xl transition-all relative",
                                                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                        )}
                                                    >
                                                        {item.icon}
                                                        <span className="text-[10px] font-black uppercase tracking-widest translate-y-[1px]">{item.name}</span>
                                                        {(item as any).badge && (
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[8px] font-black w-5 h-5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                                                {(item as any).badge}
                                                            </span>
                                                        )}
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
                                    className="w-full flex items-center gap-4 py-4 px-6 rounded-2xl bg-destructive/5 text-destructive font-black text-[10px] uppercase tracking-widest transition-all hover:bg-destructive/10"
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
                        {cmsSettings?.logoUrl ? (
                            <div className="p-1 rounded-xl bg-muted/50 border border-border/40 shrink-0">
                                <div className="relative w-8 h-8">
                                    <img src={cmsSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        ) : (
                            <div className="p-2.5 rounded-2xl bg-primary shadow-lg shadow-primary/20 shrink-0">
                                <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                            </div>
                        )}
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-black text-xs tracking-[0.05em] text-foreground leading-tight truncate">
                                    {cmsSettings?.storeName || "SmartHub"}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-tighter text-primary mt-1">Admin Dashboard</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Fluid Navigation */}
                <nav className="flex-1 overflow-y-auto no-scrollbar py-6 flex flex-col gap-6">
                    {menuItems.map((group, idx) => (
                        <div key={idx} className="flex flex-col">
                            {!isSidebarCollapsed && (
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 px-8 mb-4 italic">{group.group}</span>
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
                                            {(item as any).badge && (
                                                <div className={cn(
                                                    "absolute bg-primary text-primary-foreground text-[8px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300",
                                                    isSidebarCollapsed 
                                                        ? "w-4 h-4 -top-1 -right-1" 
                                                        : "w-5 h-5 right-4"
                                                )}>
                                                    {(item as any).badge}
                                                </div>
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

                {/* Footer: User Profile */}
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
                            className="flex-1 flex items-center justify-center h-11 rounded-[14px] bg-card border border-border text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-all"
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
                    "flex-1 flex flex-col min-w-0 transition-all duration-300 relative",
                    isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72",
                    "w-full overflow-x-hidden"
                )}
            >
                {/* Navigation Sections */}
                <header className="h-16 lg:h-20 bg-background/60 backdrop-blur-xl border-b border-border sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-3 rounded-xl bg-muted text-foreground"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative group flex items-center">
                            <Search className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search products, orders, customers..."
                                className="h-10 lg:h-11 bg-muted/40 border-none rounded-2xl py-2 pl-12 pr-6 text-[11px] w-48 sm:w-64 lg:w-96 font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none text-foreground placeholder:text-muted-foreground/30 italic"
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
                                            className="absolute right-0 mt-4 w-[280px] sm:w-[320px] md:w-96 bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Activity Logs</h3>
                                                <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline">Mark all read</button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                                {notifications.map((n) => (
                                                    <div key={n.id} onClick={() => markAsRead(n.id)} className={cn("p-5 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group", !n.read && "bg-primary/[0.02]")}>
                                                        <div className="flex items-start gap-4">
                                                            <div className={cn(
                                                                "p-2 rounded-xl shrink-0",
                                                                n.type === 'alert' ? "bg-destructive/10 text-destructive" :
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
                                                    View Activity Logs
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="h-6 w-[1px] bg-border mx-2" />
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-2xl border border-border">
                            <Circle size={8} className="fill-success text-success" />
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Active Session</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-12 overflow-x-hidden no-scrollbar">
                    <div className="max-w-[1600px] mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
