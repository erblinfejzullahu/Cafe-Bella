"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingBag } from "lucide-react"

const categories = [
  { id: "breakfast", name: "Breakfast", icon: "🍳" },
  { id: "skillets", name: "Skillets", icon: "🥘" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "salads", name: "Salads & Wraps", icon: "🥗" },
  { id: "sides", name: "Sides", icon: "🍟" },
  { id: "drinks", name: "Drinks", icon: "☕" },
]

const menuItems = {
  breakfast: [
    { id: 1, name: "Classic Eggs & Bacon", description: "Two eggs any style, crispy bacon, hash browns, and toast", price: 10.99, popular: true },
    { id: 2, name: "Steak and Eggs", description: "6oz sirloin steak, two eggs, hash browns, and toast", price: 15.99, popular: true },
    { id: 3, name: "Ham Omelet", description: "Three-egg omelet with ham and cheddar, served with hash browns", price: 11.99, popular: false },
    { id: 4, name: "Tropical Waffle", description: "Belgian waffle topped with fresh fruit and whipped cream", price: 12.99, popular: true },
    { id: 5, name: "French Toast", description: "Three slices of thick-cut brioche, dusted with powdered sugar", price: 10.99, popular: false },
    { id: 6, name: "Pancake Stack", description: "Three fluffy buttermilk pancakes with maple syrup", price: 9.99, popular: false },
  ],
  skillets: [
    { id: 7, name: "Farmer's Skillet", description: "Hash browns, bacon, sausage, peppers, onions, and cheese topped with eggs", price: 13.99, popular: true },
    { id: 8, name: "Veggie Skillet", description: "Hash browns with seasonal vegetables, mushrooms, and cheese", price: 12.99, popular: false },
    { id: 9, name: "Meat Lovers Skillet", description: "Hash browns loaded with bacon, ham, sausage, and cheese", price: 14.99, popular: true },
    { id: 10, name: "Southwest Skillet", description: "Hash browns with chorizo, jalapeños, peppers, and salsa", price: 13.99, popular: false },
  ],
  burgers: [
    { id: 11, name: "Classic Bella Burger", description: "Half-pound beef patty, lettuce, tomato, onion, pickles", price: 12.99, popular: true },
    { id: 12, name: "Bacon Cheddar Burger", description: "Beef patty with crispy bacon and melted cheddar", price: 14.99, popular: true },
    { id: 13, name: "Mushroom Swiss Burger", description: "Beef patty with sautéed mushrooms and Swiss cheese", price: 14.99, popular: false },
    { id: 14, name: "BBQ Burger", description: "Beef patty with BBQ sauce, onion rings, and cheddar", price: 14.99, popular: false },
  ],
  salads: [
    { id: 15, name: "Chicken Special Salad", description: "Grilled chicken breast over mixed greens with house dressing", price: 12.99, popular: true },
    { id: 16, name: "Caesar Salad", description: "Romaine, parmesan, croutons, and Caesar dressing", price: 10.99, popular: false },
    { id: 17, name: "Gyro Wrap", description: "Seasoned lamb and beef with tzatziki, tomato, and onion", price: 11.99, popular: true },
    { id: 18, name: "Chicken Quesadilla", description: "Grilled chicken, peppers, onions, and melted cheese", price: 11.99, popular: false },
  ],
  sides: [
    { id: 19, name: "Hash Browns", description: "Golden crispy shredded potatoes", price: 3.99, popular: true },
    { id: 20, name: "French Fries", description: "Crispy golden fries", price: 3.99, popular: false },
    { id: 21, name: "Toast", description: "White or wheat with butter", price: 2.49, popular: false },
    { id: 22, name: "Cottage Cheese", description: "Creamy cottage cheese", price: 2.99, popular: false },
    { id: 23, name: "Chicken Noodle Soup", description: "Homemade soup with tender chicken", price: 4.99, popular: true },
  ],
  drinks: [
    { id: 24, name: "Fresh Coffee", description: "Locally roasted, bottomless cup", price: 2.99, popular: true },
    { id: 25, name: "Fresh Orange Juice", description: "Freshly squeezed", price: 3.99, popular: false },
    { id: 26, name: "Hot Tea", description: "Selection of herbal and black teas", price: 2.49, popular: false },
    { id: 27, name: "Soft Drinks", description: "Pepsi products", price: 2.49, popular: false },
  ],
}

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState("breakfast")
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const getItemQuantity = (id: number) => {
    return cart.find((i) => i.id === id)?.quantity || 0
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <section id="menu" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Our Menu
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From hearty breakfasts to delicious lunch options, we&apos;ve got something for everyone.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-card text-foreground hover:bg-primary/10"
              }`}
            >
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Menu items grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {menuItems[activeCategory as keyof typeof menuItems].map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          {item.popular && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                      
                      {getItemQuantity(item.id) > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {getItemQuantity(item.id)}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Floating cart */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            >
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl rounded-full px-8 py-6 text-lg"
                onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                <span className="mr-2">View Cart ({totalItems})</span>
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
