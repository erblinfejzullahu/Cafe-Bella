"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import type { Review } from "@/types"

const FALLBACK_REVIEWS: Review[] = [
  { id: "1", customer_name: "Sarah M.", rating: 5, comment: "Best breakfast spot in Sheboygan! The Farmer's Skillet is absolutely incredible. The staff is always so friendly and welcoming.", is_approved: true, created_at: "" },
  { id: "2", customer_name: "James K.", rating: 5, comment: "I've been coming here every Sunday for 3 years. The steak and eggs are perfect every single time. Real comfort food done right.", is_approved: true, created_at: "" },
  { id: "3", customer_name: "Emily R.", rating: 4, comment: "Wonderful little cafe with a cozy atmosphere. The French toast melts in your mouth. Definitely becoming a regular!", is_approved: true, created_at: "" },
  { id: "4", customer_name: "Michael T.", rating: 5, comment: "The coffee is fantastic and always hot. Great place to start the morning. Service is quick even when they're busy.", is_approved: true, created_at: "" },
  { id: "5", customer_name: "Lisa D.", rating: 5, comment: "Brought my family here for brunch and everyone loved it! Kids especially loved the pancakes. Will be back soon!", is_approved: true, created_at: "" },
  { id: "6", customer_name: "Robert J.", rating: 4, comment: "Great food at fair prices. The bacon cheddar burger at lunch is a hidden gem. Highly recommend!", is_approved: true, created_at: "" },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-border"}`}
        />
      ))}
    </div>
  )
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-accent/20 text-accent",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-rose-100 text-rose-600",
  ]
  const i = name.charCodeAt(0) % colors.length
  return colors[i]
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reviews")
        if (!res.ok) return
        const { reviews: data } = await res.json()
        if (data?.length >= 3) setReviews(data)
      } catch {}
    }
    load()
  }, [])

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <section id="reviews" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mt-3 mb-4">
            What Our Guests Say
          </h2>

          {/* Rating summary */}
          <div className="inline-flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-6 py-3 mt-2">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground font-serif">{avgRating.toFixed(1)}</p>
              <StarRating rating={Math.round(avgRating)} />
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Excellent</p>
              <p className="text-xs text-muted-foreground">Based on {reviews.length} reviews</p>
            </div>
          </div>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-primary/30 flex-shrink-0" />

              {/* Review text */}
              <p className="text-foreground/80 leading-relaxed text-sm flex-1">
                "{review.comment}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(review.customer_name)}`}>
                    {getInitials(review.customer_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.customer_name}</p>
                    <p className="text-xs text-muted-foreground">Verified Guest</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground text-sm">
            Join hundreds of happy guests.{" "}
            <a
              href="#order"
              className="text-primary hover:underline font-medium"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Order your first meal →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
