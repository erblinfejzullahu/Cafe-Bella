"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingBag, Clock, MapPin, Phone, Truck, Store, UtensilsCrossed } from "lucide-react"

export function OrderSection() {
  const [orderType, setOrderType] = useState("takeaway")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    instructions: "",
    pickupTime: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    alert("Order submitted! We'll contact you shortly to confirm.")
  }

  return (
    <section id="order" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Order Online
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Skip the wait! Order ahead for pickup or delivery and enjoy your favorites faster.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Order form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Your Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Order type */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Order Type</Label>
                    <RadioGroup
                      value={orderType}
                      onValueChange={setOrderType}
                      className="grid grid-cols-3 gap-4"
                    >
                      <Label
                        htmlFor="dinein"
                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          orderType === "dinein"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value="dinein" id="dinein" className="sr-only" />
                        <UtensilsCrossed className="h-6 w-6 mb-2 text-primary" />
                        <span className="text-sm font-medium">Dine-in</span>
                      </Label>
                      <Label
                        htmlFor="takeaway"
                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          orderType === "takeaway"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value="takeaway" id="takeaway" className="sr-only" />
                        <Store className="h-6 w-6 mb-2 text-primary" />
                        <span className="text-sm font-medium">Takeaway</span>
                      </Label>
                      <Label
                        htmlFor="delivery"
                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          orderType === "delivery"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                        <Truck className="h-6 w-6 mb-2 text-primary" />
                        <span className="text-sm font-medium">Delivery</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {/* Contact info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(920) 555-0123"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Conditional fields */}
                  {orderType === "delivery" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="123 Main St, Sheboygan, WI"
                        value={formData.address}
                        onChange={handleInputChange}
                        required={orderType === "delivery"}
                      />
                    </motion.div>
                  )}

                  {(orderType === "takeaway" || orderType === "dinein") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="pickupTime">Preferred Pickup Time</Label>
                      <Input
                        id="pickupTime"
                        name="pickupTime"
                        type="time"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                      />
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Instructions (optional)</Label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      placeholder="Any allergies, special requests, or additional notes..."
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Place Order
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing an order, you agree to our terms. We&apos;ll call to confirm your order and payment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hours of Operation</h3>
                <div className="space-y-1 text-primary-foreground/90">
                  <p>Monday - Sunday</p>
                  <p className="text-2xl font-bold">6:00 AM - 4:00 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <MapPin className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Find Us</h3>
                <p className="text-muted-foreground mb-4">
                  725 Indiana Ave<br />
                  Sheboygan, WI 53081
                </p>
                <a
                  href="https://www.google.com/maps/place/Cafe+Bella/@43.7428936,-87.7150993,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  Get Directions
                  <span aria-hidden="true">→</span>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Phone className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Call Us</h3>
                <a
                  href="tel:+19203952354"
                  className="text-2xl font-bold text-primary hover:underline"
                >
                  (920) 395-2354
                </a>
                <p className="text-muted-foreground mt-2">
                  For reservations, questions, or large orders
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
