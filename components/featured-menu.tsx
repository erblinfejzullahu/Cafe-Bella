"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart"
import { toast } from "sonner"

type Product = {
  id: string; name: string; price: number
  description: string | null; image_url: string | null
  is_popular: boolean; is_available: boolean
  categories?: { slug: string } | null
}

const CAT_IMG: Record<string, string> = {
  "omelettes":           "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
  "eggs-more":           "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
  "skillets":            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  "pancakes-waffles":    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
  "french-toast-crepes": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
  "breakfast-specials":  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666",
  "salads-plates":       "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  "burgers":             "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  "sandwiches-wraps":    "https://images.unsplash.com/photo-1553909489-cd47e0907980",
  "sides-soups":         "https://images.unsplash.com/photo-1547592180-85f173990554",
  "desserts":            "https://images.unsplash.com/photo-1551024506-0bccd828d307",
  "beverages":           "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
  "kids":                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
}

const FALLBACK: Product[] = [
  { id: "f-sk8",  name: "Combo Skillet",                    price: 11.99, description: "Bacon, sausage, ham, green peppers, onions, mushrooms, tomatoes, cheddar — with hash browns, toast & two eggs",    image_url: CAT_IMG["skillets"],           is_popular: true, is_available: true },
  { id: "f-bs1",  name: "Eggs Benedict",                    price: 10.99, description: "Two poached eggs smothered in hollandaise sauce on an English muffin with Canadian bacon",                           image_url: CAT_IMG["eggs-more"],          is_popular: true, is_available: true },
  { id: "f-ft4",  name: "Strawberry Cheesecake French Toast",price: 9.99,  description: "Our famous strawberry cheesecake French toast — a true crowd favorite",                                              image_url: CAT_IMG["french-toast-crepes"],is_popular: true, is_available: true },
  { id: "f-b3",   name: "Bacon Cheeseburger",               price: 12.09, description: "1/3 lb. freshly ground beef with thick cheese and crispy bacon. Served with fries and homemade soup",                image_url: CAT_IMG["burgers"],            is_popular: true, is_available: true },
  { id: "f-pw5",  name: "Tropical Pancakes",                price: 9.99,  description: "Fluffy pancakes with banana, kiwi, and strawberry with raspberry sauce",                                              image_url: CAT_IMG["pancakes-waffles"],   is_popular: true, is_available: true },
  { id: "f-sl12", name: "Gyros Plate",                      price: 14.49, description: "Tender gyros on pita with onion, tomato, cucumber sauce. Served with a small Grecian salad and choice of potato",   image_url: CAT_IMG["salads-plates"],      is_popular: true, is_available: true },
]

function getImage(product: Product): string {
  if (product.image_url) return product.image_url
  const slug = product.categories?.slug
  return slug ? (CAT_IMG[slug] ?? CAT_IMG["skillets"]) : CAT_IMG["skillets"]
}

export function FeaturedMenu() {
  const [products, setProducts] = useState<Product[]>(FALLBACK)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(({ products: prods }) => {
        if (!prods?.length) return
        const popular = (prods as Product[]).filter(p => p.is_popular && p.is_available)
        if (popular.length >= 3) setProducts(popular.slice(0, 6))
      })
      .catch(() => {})
  }, [])

  const handleAdd = (item: Product) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url })
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
          {products.map((item, i) => (
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
                  src={getImage(item)}
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
