"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft, User, Phone, Mail, FileText,
  ShoppingBag, ChevronRight, Loader2, CheckCircle,
  Home, Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/contact-section"
import { useCartStore } from "@/lib/store/cart"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const TAX_RATE = 0.055

const checkoutSchema = z.object({
  name:      z.string().min(2, "Name must be at least 2 characters"),
  phone:     z.string().min(10, "Please enter a valid phone number"),
  email:     z.string().email("Please enter a valid email").optional().or(z.literal("")),
  orderType: z.enum(["dine-in", "takeaway"]),
  notes:     z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const ORDER_TYPES = [
  { value: "dine-in",  label: "Dine In",   icon: Home,    description: "Eat at the cafe"     },
  { value: "takeaway", label: "Takeaway",   icon: Package, description: "Pick up your order"  },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()
  const [submitting, setSubmitting] = useState(false)

  const subtotal = totalPrice()
  const tax      = subtotal * TAX_RATE
  const total    = subtotal + tax

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", phone: "", email: "", orderType: "takeaway", notes: "" },
  })

  const orderType = form.watch("orderType")

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-36 pb-20 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-2xl font-serif font-bold mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
          <Button asChild><Link href="/menu">Browse Menu</Link></Button>
        </div>
        <Footer />
      </div>
    )
  }

  const handleSubmit = async (data: CheckoutForm) => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: data.name, phone: data.phone, email: data.email || null },
          orderType: data.orderType,
          items: items.map(item => ({
            id: item.id, name: item.name, price: item.price,
            quantity: item.quantity, notes: item.notes,
          })),
          notes: data.notes || null,
          deliveryAddress: null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to place order")
      }

      const { order } = await res.json()
      clearCart()
      router.push(`/order-success/${order.id}`)
    } catch (err) {
      toast.error("Failed to place order", {
        description: err instanceof Error ? err.message : "Please try again",
      })
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/cart" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Cart
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border/60 p-6 md:p-8">
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Your Details</h1>

              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Contact info */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h2>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" placeholder="John Smith"
                        className={cn("pl-9", form.formState.errors.name && "border-destructive")}
                        {...form.register("name")} />
                    </div>
                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" placeholder="(920) 555-0123" type="tel"
                        className={cn("pl-9", form.formState.errors.phone && "border-destructive")}
                        {...form.register("phone")} />
                    </div>
                    {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" placeholder="john@example.com" type="email"
                        className={cn("pl-9", form.formState.errors.email && "border-destructive")}
                        {...form.register("email")} />
                    </div>
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                {/* Order type — Dine In or Takeaway only */}
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Order Type</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {ORDER_TYPES.map(({ value, label, icon: Icon, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => form.setValue("orderType", value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 text-center",
                          orderType === value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn("h-6 w-6", orderType === value ? "text-primary" : "")} />
                        <span className="font-semibold text-sm">{label}</span>
                        <span className="text-[11px] opacity-70">{description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea id="notes" placeholder="Allergies, special requests, or any other notes..."
                      className="pl-9 resize-none" rows={3} {...form.register("notes")} />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold gap-2" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" />Placing Order...</>
                  ) : (
                    <><CheckCircle className="h-5 w-5" />Place Order — ${total.toFixed(2)}</>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By placing your order, you agree to our terms. Payment is due at pickup.
                </p>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border/60 p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-serif font-bold text-foreground">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                        {item.quantity}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        {item.notes && <p className="text-xs text-muted-foreground truncate">{item.notes}</p>}
                      </div>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5.5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary/5 rounded-xl">
                <p className="text-xs text-muted-foreground text-center">
                  💳 Payment collected at {orderType === "dine-in" ? "your table" : "pickup"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
