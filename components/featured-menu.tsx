"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart"
import { toast } from "sonner"

// ─── Verified Unsplash photo IDs ─────────────────────────────────────────────
const FEATURED = [
  {
    id: "f-sk8",
    name: "Combo Skillet",
    price: 11.99,
    description: "Bacon, sausage, ham, green peppers, onions, mushrooms, tomatoes, cheddar — with hash browns, toast & two eggs",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
    popular: true,
  },
  {
    id: "f-bs1",
    name: "Eggs Benedict",
    price: 10.99,
    description: "Two poached eggs smothered in hollandaise sauce on an English muffin with Canadian bacon",
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
    popular: true,
  },
  {
    id: "f-ft4",
    name: "Strawberry Cheesecake French Toast",
    price: 9.99,
    description: "Our famous strawberry cheesecake French toast — a true crowd favorite",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
    popular: true,
  },
  {
    id: "f-b3",
    name: "Bacon Cheeseburger",
    price: 12.09,
    description: "1/3 lb. freshly ground beef with thick cheese and crispy bacon. Served with fries and homemade soup",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    popular: true,
  },
  {
    id: "f-pw5",
    name: "Tropical Pancakes",
    price: 9.99,
    description: "Fluffy pancakes with banana, kiwi, and strawberry with raspberry sauce",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
    popular: true,
  },
  {
    id: "f-sl12",
    name: "Gyros Plate",
    price: 14.49,
    description: "Tender gyros on pita with onion, tomato, cucumber sauce. Served with a small Grecian salad and choice of potato",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    popular: true,
  },
]

export function FeaturedMenu() {
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = (item: typeof FEATURED[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image })
    toast.success(`Added ${item.name} to cart`, {
      description: `$${item.price.toFixed(2)}`,
      action: { label: "View Cart", onClick: () => (window.location.href = "/cart") },
    })
  }

  return (
    <section id="menu" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-widest">Our Menu</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mt-3 mb-4">
            Customer Favorites
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Handcrafted from scratch every morning. These are the dishes our regulars can't stop ordering.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {FEATURED.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  <Star className="h-3 w-3 fill-current" />
                  Popular
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-1.5 leading-tight">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAdd(item)}
                    className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline" className="gap-2 group">
            <Link href="/menu">
              View Full Menu
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
