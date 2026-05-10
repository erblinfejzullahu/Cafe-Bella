"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowDown, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
          alt="Cafe Bella warm restaurant atmosphere"
          fill className="object-cover" priority unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      <div className="relative w-full container mx-auto px-4 pb-16 md:pb-24 pt-32">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-5 leading-[1.05]"
          >
            Where Every Meal
            <br />
            Feels Like{" "}
            <span className="text-amber-400">Home</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-base md:text-lg text-white/70 mb-8 max-w-md leading-relaxed"
          >
            Sheboygan's favorite breakfast &amp; lunch spot. Scratch-made omelettes,
            sizzling skillets, juicy burgers — served with a smile every day except Thursday.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button asChild size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 text-base font-semibold shadow-xl shadow-accent/20 h-12"
            >
              <Link href="/menu">Order Online Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg"
              className="px-8 text-base bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 hover:text-white h-12"
            >
              <Link href="/#menu">Explore Menu</Link>
            </Button>
          </motion.div>

          {/* Service badges — Dine-in and Takeaway only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="flex flex-wrap items-center gap-5 mt-8 text-sm text-white/45"
          >
            {["Dine-in", "Takeaway"].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-400" />
                {s}
              </span>
            ))}
            <span className="hidden sm:block text-white/20">·</span>
            <a href="tel:+19203952354" className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3 w-3" />
              (920) 395-2354
            </a>
            <span className="hidden sm:block text-white/20">·</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              725 Indiana Ave, Sheboygan
            </span>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="/#menu"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-1.5 text-white/35 hover:text-white/65 transition-colors"
        onClick={(e) => { e.preventDefault(); document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }) }}
      >
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.a>
    </section>
  )
}
