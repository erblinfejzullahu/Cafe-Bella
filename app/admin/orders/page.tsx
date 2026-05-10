"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock, ChefHat, Package, Truck, XCircle, CheckCircle,
  RefreshCw, Search, Phone, MapPin, ChevronDown,
  ChevronUp, Bell, BellOff, ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { OrderWithItems, OrderStatus } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-amber-600", bg: "bg-amber-100"  },
  preparing: { label: "Preparing", icon: ChefHat,      color: "text-blue-600",  bg: "bg-blue-100"   },
  ready:     { label: "Ready",     icon: Package,      color: "text-green-600", bg: "bg-green-100"  },
  delivered: { label: "Delivered", icon: CheckCircle,  color: "text-emerald-600", bg: "bg-emerald-100" },
  rejected:  { label: "Rejected",  icon: XCircle,      color: "text-red-500",   bg: "bg-red-100"    },
}

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:   ["preparing", "rejected"],
  preparing: ["ready"],
  ready:     ["delivered"],
  delivered: [],
  rejected:  [],
}

const ALL_STATUSES: OrderStatus[] = ["pending", "preparing", "ready", "delivered", "rejected"]

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<OrderWithItems[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<OrderStatus | "all">("all")
  const [search, setSearch]           = useState("")
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [updating, setUpdating]       = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [lastFetch, setLastFetch]     = useState(new Date())
  const [muted, setMuted]             = useState(false)

  // Audio ref — initialised once on mount
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio("/ordersound.m4a")
    audio.preload = "auto"
    audioRef.current = audio
    return () => { audioRef.current = null }
  }, [])

  const playSound = useCallback(() => {
    if (muted || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {
      // Autoplay blocked — silently ignore (browser requires prior interaction)
    })
  }, [muted])

  const fetchOrders = useCallback(async () => {
    try {
      const url = filter === "all" ? "/api/orders?limit=100" : `/api/orders?status=${filter}&limit=100`
      const res = await fetch(url)
      const { orders: data } = await res.json()

      const withItems = await Promise.all(
        (data || []).map(async (order: OrderWithItems) => {
          const r = await fetch(`/api/orders/${order.id}`)
          const { order: full } = await r.json()
          return full
        })
      )
      setOrders(withItems.filter(Boolean))
      setLastFetch(new Date())
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchOrders()

    const supabase = createClient()

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Play sound only on new orders (INSERT)
          if (payload.eventType === "INSERT") {
            playSound()
            toast.info("🔔 New order received!", {
              description: `Order from ${(payload.new as { customer_name?: string }).customer_name ?? "customer"}`,
              duration: 6000,
            })
          }
          fetchOrders()
        }
      )
      .subscribe()

    const poll = setInterval(fetchOrders, 20_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [fetchOrders, playSound])

  const updateStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success(`Order marked as ${status}`)
      setRejectingId(null)
      setRejectionReason("")
    } catch {
      toast.error("Failed to update order status")
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q)
    )
  })

  const statusCounts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last updated {lastFetch.toLocaleTimeString()}
            <span className="inline-flex items-center gap-1 ml-2 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {/* Mute toggle */}
          <button
            onClick={() => setMuted(m => !m)}
            title={muted ? "Unmute order sounds" : "Mute order sounds"}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
              muted
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                : "border-border bg-card text-foreground hover:bg-secondary"
            )}
          >
            {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            <span className="hidden sm:inline">{muted ? "Sounds off" : "Sounds on"}</span>
          </button>

          <Button variant="outline" onClick={fetchOrders} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all",
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50")}
        >
          All ({orders.length})
        </button>
        {ALL_STATUSES.map(s => {
          const cfg  = STATUS_CONFIG[s]
          const Icon = cfg.icon
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50")}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label} ({statusCounts[s] || 0})
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number, name, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No orders found</p>
          <p className="text-muted-foreground text-sm">
            {filter !== "all" ? `No ${filter} orders at the moment.` : "Orders will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map(order => {
              const cfg         = STATUS_CONFIG[order.status as OrderStatus]
              const Icon        = cfg.icon
              const isExpanded  = expandedId === order.id
              const transitions = STATUS_TRANSITIONS[order.status as OrderStatus]

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-2xl border border-border/60 overflow-hidden"
                >
                  {/* Order header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("h-5 w-5", cfg.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-foreground">{order.order_number}</span>
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{order.order_type}</span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5 truncate">
                        {order.customer_name} · {order.customer_phone}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="ml-1 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/50 p-4 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</h3>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                                {order.customer_phone && (
                                  <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                    <Phone className="h-3.5 w-3.5" />{order.customer_phone}
                                  </a>
                                )}
                                {order.customer_email && (
                                  <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</h3>
                              <div className="space-y-1.5">
                                {order.order_items?.map(item => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-foreground">
                                      {item.quantity}× {item.product_name}
                                      {item.notes && <span className="text-muted-foreground text-xs ml-1">({item.notes})</span>}
                                    </span>
                                    <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between text-sm font-bold">
                                  <span>Total</span>
                                  <span className="text-primary">${order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="bg-secondary/50 rounded-xl px-4 py-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                              <p className="text-sm text-foreground">{order.notes}</p>
                            </div>
                          )}

                          {/* Action buttons */}
                          {transitions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                              {transitions.map(nextStatus => {
                                const nextCfg  = STATUS_CONFIG[nextStatus]
                                const NextIcon = nextCfg.icon
                                const isRejecting = nextStatus === "rejected"

                                if (isRejecting) {
                                  return rejectingId === order.id ? (
                                    <div key={nextStatus} className="flex gap-2 w-full">
                                      <Input
                                        placeholder="Reason for rejection (optional)"
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        className="flex-1 text-sm"
                                      />
                                      <Button size="sm" variant="destructive" disabled={updating === order.id}
                                        onClick={() => updateStatus(order.id, "rejected", rejectionReason)}>
                                        Confirm Reject
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                                    </div>
                                  ) : (
                                    <Button key={nextStatus} size="sm" variant="destructive" className="gap-1.5"
                                      onClick={() => setRejectingId(order.id)}>
                                      <XCircle className="h-3.5 w-3.5" />Reject Order
                                    </Button>
                                  )
                                }

                                return (
                                  <Button key={nextStatus} size="sm" className="gap-1.5"
                                    disabled={updating === order.id}
                                    onClick={() => updateStatus(order.id, nextStatus)}>
                                    <NextIcon className="h-3.5 w-3.5" />
                                    Mark as {nextCfg.label}
                                  </Button>
                                )
                              })}
                            </div>
                          )}

                          {order.status === "rejected" && order.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                              <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
                              <p className="text-sm text-red-700">{order.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
