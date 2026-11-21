"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const toggle = () => {
        const current = resolvedTheme || theme || "dark"
        const nextTheme = current === "dark" ? "light" : "dark"
        setTheme(nextTheme)

        if (typeof document !== "undefined") {
            const root = document.documentElement
            if (nextTheme === "dark") {
                root.classList.add("dark")
                root.classList.remove("light")
                root.style.colorScheme = "dark"
            } else {
                root.classList.remove("dark")
                root.classList.add("light")
                root.style.colorScheme = "light"
            }
        }
    }

    if (!mounted) {
        return (
            <div className={`w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center bg-muted/40 text-muted-foreground ${className || ""}`}>
                <Sun className="h-4 w-4 opacity-50" />
            </div>
        )
    }

    const isDark = (resolvedTheme || theme) === "dark"

    return (
        <button
            type="button"
            onClick={toggle}
            className={`w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer ${className || ""}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
                <Moon className="h-4 w-4 text-slate-800 dark:text-slate-200 hover:-rotate-12 transition-transform" />
            )}
        </button>
    )
}
