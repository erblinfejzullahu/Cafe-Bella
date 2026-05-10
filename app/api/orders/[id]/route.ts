import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/auth'

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!configured()) {
    const order = mem.get(id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  }

  try {
    const client = sb()
    const { data: order, error } = await client.from('orders').select('*').eq('id', id).maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const { data: items } = await client.from('order_items').select('*').eq('order_id', id)
    return NextResponse.json({ order: { ...order, order_items: items ?? [] } })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status, estimatedTime, rejectionReason } = await request.json()

  if (!configured()) {
    const order = mem.get(id) as Record<string, unknown> | undefined
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    const updated = {
      ...order,
      ...(status            && { status }),
      ...(estimatedTime !== undefined && { estimated_time: estimatedTime }),
      ...(rejectionReason   && { rejection_reason: rejectionReason }),
      updated_at: new Date().toISOString(),
    }
    mem.set(id, updated)
    return NextResponse.json({ order: updated })
  }

  try {
    // Use rpc() — avoids PostgREST table-write issues
    const { data, error } = await sb().rpc('update_order_status', {
      p_id:               id,
      p_status:           status,
      p_estimated_time:   estimatedTime  ?? null,
      p_rejection_reason: rejectionReason ?? null,
    })

    if (error) {
      console.error('update_order_status rpc error:', error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
