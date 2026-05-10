import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

declare global { var _memOrders: Map<string, object> | undefined }
if (!global._memOrders) global._memOrders = new Map()
const mem = global._memOrders

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function configured() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('.supabase.co')
    && (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').startsWith('eyJ')
}

function orderNumber() {
  const d = new Date()
  return `CB-${d.toISOString().slice(0, 10).replace(/-/g, '')}${d.getTime().toString().slice(-6)}`
}

// Returns null if the string is not a valid UUID (e.g. static fallback IDs like "o1", "sk8")
function toUUID(id: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null
}

export async function POST(req: NextRequest) {
  try {
    const { customer, orderType, items, notes, deliveryAddress } = await req.json()
    if (!customer?.name || !customer?.phone || !orderType || !items?.length)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    const tax   = +(subtotal * 0.055).toFixed(2)
    const total = +(subtotal + tax).toFixed(2)
    const sub   = +subtotal.toFixed(2)
    const id    = crypto.randomUUID()
    const now   = new Date().toISOString()
    const num   = orderNumber()

    // ── In-memory fallback ────────────────────────────────────────────────
    if (!configured()) {
      const order = {
        id, order_number: num,
        customer_name: customer.name, customer_email: customer.email || null,
        customer_phone: customer.phone, order_type: orderType, status: 'pending',
        delivery_address: deliveryAddress || null, subtotal: sub, tax, total,
        notes: notes || null, estimated_time: null, rejection_reason: null,
        created_at: now, updated_at: now,
        order_items: items.map((item: { id: string; name: string; price: number; quantity: number; notes?: string }) => ({
          id: crypto.randomUUID(), order_id: id, product_id: toUUID(item.id),
          product_name: item.name, product_price: item.price, quantity: item.quantity,
          subtotal: +(item.price * item.quantity).toFixed(2), notes: item.notes || null, created_at: now,
        })),
      }
      mem.set(id, order)
      return NextResponse.json({ order }, { status: 201 })
    }

    // ── Supabase via rpc() ────────────────────────────────────────────────
    const { data, error } = await sb().rpc('create_order', {
      order_data: {
        id,
        order_number: num,
        customer_name: customer.name,
        customer_email: customer.email || null,
        customer_phone: customer.phone,
        order_type: orderType,
        delivery_address: deliveryAddress || null,
        subtotal: sub,
        tax,
        total,
        notes: notes || null,
        items: items.map((item: { id: string; name: string; price: number; quantity: number; notes?: string }) => ({
          product_id:    toUUID(item.id),   // null if not a real UUID (static fallback items)
          product_name:  item.name,
          product_price: item.price,
          quantity:      item.quantity,
          subtotal:      +(item.price * item.quantity).toFixed(2),
          notes:         item.notes || null,
        })),
      },
    })

    if (error) {
      console.error('create_order rpc error:', error)
      return NextResponse.json({ error: error.message, code: error.code, hint: error.hint }, { status: 500 })
    }

    return NextResponse.json({ order: data }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('POST /api/orders crash:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit  = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    if (!configured()) {
      let orders = Array.from(mem.values()) as Array<Record<string, unknown>>
      if (status && status !== 'all') orders = orders.filter(o => o.status === status)
      orders = orders
        .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
        .slice(0, limit)
      return NextResponse.json({ orders, count: orders.length })
    }

    let q = sb().from('orders').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).limit(limit)
    if (status && status !== 'all') q = q.eq('status', status)
    const { data, error, count } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ orders: data, count })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
