"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Only render after component is mounted to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="rounded-xl w-10 h-10 border-slate-100" suppressHydrationWarning>
                <div className="w-5 h-5 bg-slate-100 rounded-full animate-pulse" suppressHydrationWarning />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-xl w-10 h-10 transition-all hover:bg-slate-100 dark:hover:bg-white/10 group overflow-hidden"
            suppressHydrationWarning
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:text-primary" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:text-primary" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
