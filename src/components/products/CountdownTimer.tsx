
"use client"

import React, { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(endDate) - +new Date()
            
            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
            }
        }

        const timer = setInterval(calculateTimeLeft, 1000)
        calculateTimeLeft()

        return () => clearInterval(timer)
    }, [endDate])

    const pad = (n: number) => n.toString().padStart(2, '0')

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-white">
            <Clock size={12} className="text-red-500 animate-pulse" />
            <div className="flex items-center gap-1 font-black italic text-[10px] tracking-tighter">
                <span className="w-4 text-center">{pad(timeLeft.hours)}</span>
                <span className="opacity-50">:</span>
                <span className="w-4 text-center">{pad(timeLeft.minutes)}</span>
                <span className="opacity-50">:</span>
                <span className="w-4 text-center">{pad(timeLeft.seconds)}</span>
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest ml-1 opacity-60">LEFT</span>
        </div>
    )
}
