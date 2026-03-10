"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SwitchProps {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ checked = false, onCheckedChange, disabled = false, className, ...props }, ref) => {
        const [internalChecked, setInternalChecked] = React.useState(checked)

        // Sync with prop if it changes externally
        React.useEffect(() => {
            setInternalChecked(checked)
        }, [checked])

        const handleToggle = () => {
            if (disabled) return
            const newState = !internalChecked
            setInternalChecked(newState)
            if (onCheckedChange) {
                onCheckedChange(newState)
            }
        }

        return (
            <button
                type="button"
                role="switch"
                aria-checked={internalChecked}
                disabled={disabled}
                onClick={handleToggle}
                className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    internalChecked ? "bg-primary" : "bg-muted",
                    className
                )}
                {...props}
                ref={ref}
            >
                <motion.span
                    animate={{
                        x: internalChecked ? 16 : 0,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                    }}
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform"
                    )}
                />
            </button>
        )
    }
)

Switch.displayName = "Switch"

export { Switch }
