import type { Metadata } from "next"
import { Suspense } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle,
  DollarSign, Users, XCircle, ChefHat
} from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getStats() {
  try {
    const supabase = getServiceClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [ordersRes, todayRes, revenueRes] = await Promise.all([
      supabase.from("orders").select("status", { count: "exact" }),
      supabase.from("orders").select("total, status").gte("created_at", today.toISOString()),
      supabase.from("orders").select("total").eq("status", "delivered"),
    ])

    const allOrders = ordersRes.data || []
    const todayOrders = todayRes.data || []
    const delivered = revenueRes.data || []

    const statusCount = allOrders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})

    const todayRevenue = todayOrders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0)
    const totalRevenue = delivered.reduce((s, o) => s + o.total, 0)

    return {
      total: ordersRes.count || 0,
      pending: statusCount.pending || 0,
      preparing: statusCount.preparing || 0,
      ready: statusCount.ready || 0,
      delivered: statusCount.delivered || 0,
      rejected: statusCount.rejected || 0,
      todayOrders: todayOrders.length,
      todayRevenue,
      totalRevenue,
    }
  } catch {
    return {
      total: 0, pending: 0, preparing: 0, ready: 0,
      delivered: 0, rejected: 0, todayOrders: 0, todayRevenue: 0, totalRevenue: 0
    }
  }
}

async function getRecentOrders() {
  try {
    const supabase = getServiceClient()
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)
    return data || []
  } catch {
    return []
  }
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
}

async function DashboardContent() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Preparing", value: stats.preparing, icon: ChefHat, color: "text-violet-600 bg-violet-50" },
    { label: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Total Delivered", value: stats.delivered, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-primary bg-primary/10" },
    { label: "All Orders", value: stats.total, icon: Users, color: "text-foreground bg-secondary" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500 bg-red-50" },
  ]

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-card rounded-2xl border border-border/60 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Order status distribution */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Status Overview</h2>
          <div className="space-y-3">
            {[
              { label: "Pending", count: stats.pending, color: "bg-amber-400", total: stats.total },
              { label: "Preparing", count: stats.preparing, color: "bg-blue-400", total: stats.total },
              { label: "Ready", count: stats.ready, color: "bg-green-400", total: stats.total },
              { label: "Delivered", count: stats.delivered, color: "bg-emerald-500", total: stats.total },
              { label: "Rejected", count: stats.rejected, color: "bg-red-400", total: stats.total },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all duration-700`}
                    style={{ width: s.total > 0 ? `${(s.count / s.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Manage Orders", href: "/admin/orders", icon: ShoppingBag, desc: "View & update orders" },
              { label: "Manage Products", href: "/admin/products", icon: ChefHat, desc: "Edit menu items" },
              { label: "Analytics", href: "/admin/analytics", icon: TrendingUp, desc: "Sales reports" },
              { label: "View Site", href: "/", icon: Users, desc: "Customer view", target: "_blank" },
            ].map((action) => {
              const Icon = action.icon
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target={'target' in action ? action.target : undefined}
                  className="flex flex-col gap-1.5 p-4 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.desc}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-primary hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-xs font-semibold text-foreground">{order.order_number}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-foreground">{order.customer_name}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs capitalize text-muted-foreground">{order.order_type}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-secondary text-foreground"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
