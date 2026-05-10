"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Clock, Award, Users } from "lucide-react"

const VALUES = [
  { icon: Heart, title: "Made with Love",  description: "Every dish is crafted from scratch each morning using fresh, quality ingredients our family has chosen for decades." },
  { icon: Clock, title: "Open 6 Days",     description: "We open at 6AM every day except Thursday — because great food shouldn't have too long a curfew." },
  { icon: Award, title: "Quality First",   description: "From fresh-squeezed OJ to hand-pressed burgers, we never cut corners on quality." },
  { icon: Users, title: "Family Owned",    description: "A true family business where every team member feels like family and every guest feels at home." },
]

const STATS = [
  { value: "809+", label: "Happy Reviews" },
  { value: "4.5★", label: "Average Rating" },
  { value: "6AM",  label: "We Open Daily" },
  { value: "100+", label: "Menu Items"     },
]

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543", alt: "Fresh Eggs"  },
  { src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445", alt: "Pancakes"    },
  { src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", alt: "Burgers"     },
  { src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", alt: "Salads"      },
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-medium text-accent uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mt-3 mb-6 leading-tight">
              A Little Cafe with a Big Heart
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Nestled in the heart of Sheboygan, Cafe Bella has been waking up the neighborhood
                with the smell of fresh coffee and sizzling skillets. What started as a dream became
                a community staple loved by locals and visitors alike.
              </p>
              <p>
                Our menu celebrates the classics — comfort food that feels like a hug. From 19
                omelette varieties and 13 skillet options to hand-crafted burgers, legendary crepes,
                and Wisconsin cheese curds, everything is made fresh to order, every day.
              </p>
              <p>
                We're open Monday through Wednesday and Friday through Sunday, 6AM to 4PM.
                Thursday is our rest day — we'll be back Friday, recharged and ready to cook!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {STATS.map((s) => (
                <div key={s.label} className="text-center p-4 bg-secondary/50 rounded-2xl">
                  <p className="text-2xl font-bold text-primary font-serif">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {VALUES.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card border border-border/60 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5 text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
                alt="Beautiful breakfast spread at Cafe Bella"
                fill className="object-cover" unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-xl px-4 py-2.5 shadow-lg">
                <p className="font-serif font-bold text-foreground text-sm">Open Daily (except Thu)</p>
                <p className="text-xl font-serif font-bold text-primary">6 AM – 4 PM</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {GALLERY.map((img, i) => (
                <motion.div
                  key={img.src}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative h-36 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {img.alt}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-primary text-primary-foreground rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">Mon–Wed & Fri–Sun</p>
                <p className="text-primary-foreground/70 text-sm">Closed Thursdays · 725 Indiana Ave</p>
              </div>
              <a
                href="tel:+19203952354"
                className="bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
