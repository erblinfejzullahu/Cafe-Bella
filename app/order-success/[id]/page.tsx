"use client"

import { useEffect, useState, useCallback } from "react"
import { use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle, Clock, ChefHat, Package, Truck, XCircle,
  Home, ShoppingBag, Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/client"
import type { OrderWithItems } from "@/types"

type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "rejected"

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  step: number
}> = {
  pending:   { label: "Order Received",    description: "We've received your order and will confirm it shortly.", icon: Clock,        color: "text-amber-600", bg: "bg-amber-50 border-amber-200", step: 1 },
  preparing: { label: "Being Prepared",    description: "Our kitchen is cooking your order fresh right now!",    icon: ChefHat,      color: "text-blue-600",  bg: "bg-blue-50 border-blue-200",   step: 2 },
  ready:     { label: "Ready for Pickup",  description: "Your order is ready! Please come pick it up.",          icon: Package,      color: "text-green-600", bg: "bg-green-50 border-green-200", step: 3 },
  delivered: { label: "Delivered",         description: "Your order has been delivered. Enjoy your meal!",       icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50 border-green-200", step: 4 },
  rejected:  { label: "Order Rejected",    description: "Unfortunately we couldn't process your order.",         icon: XCircle,      color: "text-red-600",   bg: "bg-red-50 border-red-200",     step: 0 },
}

const STEPS: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Received",  icon: CheckCircle },
  { label: "Preparing", icon: ChefHat },
  { label: "Ready",     icon: Package },
  { label: "Delivered", icon: Truck },
]

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) return
      const { order: data } = await res.json()
      setOrder(data)
      setLastUpdated(new Date())
    } catch {}
  }, [id])

  useEffect(() => {
    fetchOrder().finally(() => setLoading(false))

    const supabase = createClient()
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        payload => { setOrder(prev => prev ? { ...prev, ...payload.new } : null); setLastUpdated(new Date()) }
      )
      .subscribe()

    const poll = setInterval(fetchOrder, 20_000)
    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [id, fetchOrder])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-36 pb-20 flex flex-col items-center text-center">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="text-2xl font-serif font-bold mb-3">Order not found</h1>
          <Button asChild><Link href="/">Go Home</Link></Button>
        </div>
      </div>
    )
  }

  const status      = order.status as OrderStatus
  const config      = STATUS_CONFIG[status]
  const Icon        = config.icon
  const currentStep = config.step

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">

        {/* Success / rejected header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          {status !== "rejected" ? (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="h-10 w-10 text-green-600" />
              </motion.div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Order Placed!</h1>
              <p className="text-muted-foreground">Order <span className="font-semibold text-foreground">{order.order_number}</span></p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Order Rejected</h1>
              {order.rejection_reason && <p className="text-muted-foreground">Reason: {order.rejection_reason}</p>}
            </>
          )}
        </motion.div>

        {/* Status card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`rounded-2xl border-2 p-5 mb-6 ${config.bg}`}
        >
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 flex-shrink-0 ${config.color}`} />
            <div>
              <p className={`font-semibold ${config.color}`}>{config.label}</p>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          {order.estimated_time && status === "preparing" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Estimated time: <strong className="text-foreground">{order.estimated_time} minutes</strong>
            </div>
          )}
        </motion.div>

        {/* ── Progress tracker ─────────────────────────────────────────── */}
        {status !== "rejected" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border/60 p-6 mb-6"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">Order Progress</h2>

            <div className="relative flex items-center justify-between px-5">
              {/* Background line — sits behind circles, inset so it starts/ends at circle centers */}
              <div className="absolute left-5 right-5 top-5 h-0.5 bg-border" style={{ transform: "translateY(-50%)" }} />

              {/* Green progress fill */}
              <motion.div
                className="absolute top-5 left-5 h-0.5 bg-primary origin-left"
                style={{ transform: "translateY(-50%)", right: "auto" }}
                initial={{ width: 0 }}
                animate={{
                  width: currentStep <= 1
                    ? "0%"
                    : `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              {/* Step circles — rendered above the lines with explicit z-index */}
              {STEPS.map((step, i) => {
                const StepIcon   = step.icon
                const stepNum    = i + 1
                const isComplete = stepNum < currentStep
                const isCurrent  = stepNum === currentStep
                const isDone     = isComplete || isCurrent

                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                    {/* Circle */}
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isDone
                          ? "bg-primary border-primary shadow-md shadow-primary/30"
                          : "bg-card border-border"
                      }`}
                      animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    >
                      <StepIcon className={`h-4 w-4 ${isDone ? "text-white" : "text-muted-foreground"}`} />
                    </motion.div>

                    {/* Label */}
                    <span className={`text-xs font-medium text-center ${isCurrent ? "text-primary font-semibold" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Order details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border/60 p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div><p className="text-muted-foreground">Customer</p><p className="font-semibold">{order.customer_name}</p></div>
            <div><p className="text-muted-foreground">Phone</p><p className="font-semibold">{order.customer_phone}</p></div>
            <div><p className="text-muted-foreground">Order Type</p><p className="font-semibold capitalize">{order.order_type}</p></div>
            {order.delivery_address && (
              <div><p className="text-muted-foreground">Deliver to</p><p className="font-semibold text-xs">{order.delivery_address}</p></div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-border pt-4 space-y-2 mb-4">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.quantity}× {item.product_name}
                  {item.notes && <span className="text-muted-foreground text-xs ml-1">({item.notes})</span>}
                </span>
                <span className="font-medium">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax (5.5%)</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span className="text-primary">${order.total.toFixed(2)}</span></div>
          </div>
        </motion.div>

        {/* Live update notice */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/50 rounded-xl px-4 py-3 mb-6"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live updates enabled
          </span>
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
        </motion.div>

        {/* Actions — restaurant phone, not customer phone */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1 gap-2">
            <a href="tel:9203952354">
              <Phone className="h-4 w-4" />
              Call Cafe Bella
            </a>
          </Button>
          <Button asChild className="flex-1 gap-2">
            <Link href="/menu">
              <ShoppingBag className="h-4 w-4" />
              Order Again
            </Link>
          </Button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
            <Home className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
