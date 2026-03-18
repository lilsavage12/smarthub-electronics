"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, MessageSquare, User, Send, CheckCircle2, StarHalf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Review {
    id: string
    userName: string
    rating: number
    comment: string
    createdAt: any
    productId: string
}

interface ProductReviewsProps {
    productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [rating, setRating] = useState(5)
    const [newReview, setNewReview] = useState({
        userName: "",
        comment: ""
    })

    // Real-time listener for reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?productId=${productId}`)
                if (res.ok) {
                    const data = await res.json()
                    // Map Postgres 'user' field to component's 'userName' which is used in the UI
                    const mapped = data.map((r: any) => ({ ...r, userName: r.user }))
                    setReviews(mapped)
                }
            } catch (error) {
                console.error("Reviews fetch error:", error)
            }
        }
        fetchReviews()
    }, [productId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newReview.userName || !newReview.comment) {
            toast.error("Please provide both name and feedback")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    user: newReview.userName,
                    rating,
                    comment: newReview.comment,
                })
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.details || "POST failed")
            }

            toast.success("Review Saved Successfully")
            setNewReview({ userName: "", comment: "" })
            setRating(5)
            setShowForm(false)

            // Refresh reviews
            const res2 = await fetch(`/api/reviews?productId=${productId}`)
            if (res2.ok) {
                const updated = await res2.json()
                setReviews(updated.map((r: any) => ({ ...r, userName: r.user })))
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Feedback submission failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "N/A"

    return (
        <div className="flex flex-col gap-8">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/20 p-6 rounded-2xl border border-border/50">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black font-outfit text-primary italic leading-none">{averageRating}</span>
                        <div className="flex flex-col">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={cn(
                                            "w-4 h-4",
                                            s <= Math.round(Number(averageRating)) ? "fill-primary text-primary" : "text-muted-foreground/30"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Based on {reviews.length} Customer Reviews</span>
                        </div>
                    </div>
                </div>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="rounded-xl h-12 px-6 text-xs font-black italic uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
                        variant="premium"
                    >
                        Share Your Experience
                    </Button>
                )}
            </div>

            {/* Review Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-background p-6 rounded-[2rem] border border-primary/20 shadow-2xl flex flex-col gap-5"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black font-outfit uppercase italic tracking-tighter">New <span className="text-primary italic">Feedback</span></h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest ml-3">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name..."
                                    className="bg-muted/40 border-none rounded-xl h-12 px-5 text-xs font-bold focus:ring-2 ring-primary/50 outline-none"
                                    value={newReview.userName}
                                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest ml-3">Your Rating</label>
                                <div className="flex items-center gap-3 h-12 px-5 bg-muted/40 rounded-xl">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star className={cn("w-5 h-5", s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                                        </button>
                                    ))}
                                    <span className="text-[10px] font-black text-primary ml-auto">{rating}/5</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase tracking-widest ml-3">Your Review</label>
                            <textarea
                                placeholder="Describe your experience with the hardware..."
                                className="bg-muted/40 border-none rounded-[1.5rem] p-5 text-xs font-bold min-h-[100px] focus:ring-2 ring-primary/50 outline-none"
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="h-14 rounded-xl text-xs font-black italic uppercase tracking-widest"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                            <Send className="ml-2 w-3.5 h-3.5" />
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* List of Reviews */}
            <div className="flex flex-col gap-8">
                {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-30">
                        <MessageSquare className="w-16 h-16" />
                        <h4 className="text-sm font-black uppercase tracking-widest">No Reviews Found</h4>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-4 p-6 rounded-2xl bg-muted/10 border border-border/50 group hover:border-primary/30 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black uppercase tracking-tighter">{review.userName}</span>
                                            <CheckCircle2 className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Just Now"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs font-medium leading-relaxed text-foreground/80 pl-3 border-l-2 border-primary/20">
                                {review.comment}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
