"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/contact-section"
import { useCartStore } from "@/lib/store/cart"
import { Textarea } from "@/components/ui/textarea"

const TAX_RATE = 0.055

export default function CartPage() {
  const { items, updateQuantity, removeItem, updateItemNotes, clearCart, totalPrice } = useCartStore()
  const subtotal = totalPrice()
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-36 pb-20 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-7xl mb-6">🛒</div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Looks like you haven't added anything yet. Browse our menu and find something delicious!
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/menu">
                <ShoppingBag className="h-4 w-4" />
                Browse Menu
              </Link>
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/menu" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Your Cart</h1>
            <p className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card rounded-2xl border border-border/60 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                      🍽️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-primary font-semibold mt-0.5">${item.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Item notes */}
                      <div className="mt-3">
                        <Textarea
                          placeholder="Special requests for this item..."
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                          className="text-sm min-h-0 h-8 resize-none py-1.5 focus:h-16 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 mt-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all items
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border/60 p-6 sticky top-28">
              <h2 className="text-xl font-serif font-bold text-foreground mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5.5%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full gap-2 h-11" size="lg">
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/menu">Add more items</Link>
                </Button>
              </div>

              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Tag className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                  <p>Your order will be prepared fresh. We'll confirm timing once you place your order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
