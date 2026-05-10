"use client"

import { useState, useEffect } from "react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import { DollarSign, ShoppingBag, TrendingUp, Users, Loader2 } from "lucide-react"
import type { Order } from "@/types"

type GroupedData = { date: string; revenue: number; orders: number }
type StatusData  = { name: string; value: number; color: string }

const STATUS_COLORS: Record<string, string> = {
  pending:   "#F59E0B",
  preparing: "#3B82F6",
  ready:     "#22C55E",
  delivered: "#10B981",
  rejected:  "#EF4444",
}

function groupByDay(orders: Order[], days: number): GroupedData[] {
  const map = new Map<string, { revenue: number; orders: number }>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    map.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), { revenue: 0, orders: 0 })
  }
  orders.forEach((o) => {
    const d   = new Date(o.created_at)
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const cut = new Date(now); cut.setDate(cut.getDate() - days)
    if (d >= cut && map.has(key)) {
      const e = map.get(key)!
      e.orders++
      if (o.status === "delivered") e.revenue += o.total
    }
  })
  return Array.from(map.entries()).map(([date, data]) => ({ date, ...data }))
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name === "revenue" ? `Revenue: $${p.value.toFixed(2)}` : `Orders: ${p.value}`}
        </p>
      ))}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange]   = useState<7 | 14 | 30>(14)

  useEffect(() => {
    fetch("/api/orders?limit=500")
      .then(r => r.json())
      .then(({ orders: data }) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const delivered     = orders.filter(o => o.status === "delivered")
  const totalRevenue  = delivered.reduce((s, o) => s + o.total, 0)
  const avgOrderValue = delivered.length ? totalRevenue / delivered.length : 0
  const today         = new Date(); today.setHours(0, 0, 0, 0)
  const todayOrders   = orders.filter(o => new Date(o.created_at) >= today)
  const todayRevenue  = todayOrders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0)
  const weekAgo       = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekOrders    = orders.filter(o => new Date(o.created_at) >= weekAgo)
  const revenueData   = groupByDay(orders, range)

  const typeCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.order_type] = (acc[o.order_type] || 0) + 1; return acc
  }, {})
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === "dine-in" ? "#4a6741" : "#8b5a2b",
  }))

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1; return acc
  }, {})
  const statusData: StatusData[] = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name] || "#888",
  }))

  const statCards = [
    { label: "Total Revenue",    value: `$${totalRevenue.toFixed(2)}`,  sub: `${delivered.length} completed orders`, icon: DollarSign, color: "text-green-600 bg-green-50"  },
    { label: "Today's Revenue",  value: `$${todayRevenue.toFixed(2)}`,  sub: `${todayOrders.length} orders today`,   icon: TrendingUp, color: "text-blue-600 bg-blue-50"   },
    { label: "Total Orders",     value: orders.length,                   sub: `${weekOrders.length} this week`,       icon: ShoppingBag, color: "text-primary bg-primary/10" },
    { label: "Avg Order Value",  value: `$${avgOrderValue.toFixed(2)}`, sub: "Delivered orders only",                icon: Users,      color: "text-amber-600 bg-amber-50"  },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sales performance and order insights</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-card rounded-2xl border border-border/60 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue chart */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Revenue & Orders</h2>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map(d => (
              <button key={d} onClick={() => setRange(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders per day */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Orders Per Day</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Types</h2>
          {typeData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name]} />
                  <Legend formatter={value => <span className="text-xs text-foreground">{value}</span>} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Status Breakdown</h2>
          {statusData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3 pt-2">
              {statusData.sort((a, b) => b.value - a.value).map((s) => {
                const tot = statusData.reduce((sum, x) => sum + x.value, 0)
                const pct = tot > 0 ? (s.value / tot) * 100 : 0
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{s.name}</span>
                      <span className="text-muted-foreground">{s.value} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary table — Dine-in and Takeaway only */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Summary by Order Type</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                {["Type", "Total Orders", "Delivered", "Rejected", "Revenue"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {["dine-in", "takeaway"].map(type => {
                const typeOrders    = orders.filter(o => o.order_type === type)
                const typeDelivered = typeOrders.filter(o => o.status === "delivered")
                const typeRejected  = typeOrders.filter(o => o.status === "rejected")
                const typeRevenue   = typeDelivered.reduce((s, o) => s + o.total, 0)
                return (
                  <tr key={type} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-foreground capitalize">{type}</td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{typeOrders.length}</td>
                    <td className="px-6 py-3.5 text-sm text-green-600">{typeDelivered.length}</td>
                    <td className="px-6 py-3.5 text-sm text-red-500">{typeRejected.length}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-foreground">${typeRevenue.toFixed(2)}</td>
                  </tr>
                )
              })}
              <tr className="bg-secondary/30 font-bold">
                <td className="px-6 py-3.5 text-sm text-foreground">Total</td>
                <td className="px-6 py-3.5 text-sm text-foreground">{orders.length}</td>
                <td className="px-6 py-3.5 text-sm text-green-600">{delivered.length}</td>
                <td className="px-6 py-3.5 text-sm text-red-500">{orders.filter(o => o.status === "rejected").length}</td>
                <td className="px-6 py-3.5 text-sm text-primary">${totalRevenue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
