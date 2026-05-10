import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const anon    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  const result: Record<string, unknown> = {
    env: {
      SUPABASE_URL:     url     || '❌ MISSING',
      ANON_KEY:         anon    ? `${anon.slice(0,20)}... (${anon.length} chars)`    : '❌ MISSING',
      SERVICE_KEY:      service ? `${service.slice(0,20)}... (${service.length} chars)` : '❌ MISSING',
      ADMIN_EMAIL:      process.env.ADMIN_EMAIL    || '❌ MISSING',
      ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ? `set (${process.env.ADMIN_JWT_SECRET.length} chars)` : '❌ MISSING',
    },
  }

  if (!url.includes('.supabase.co') || !service.startsWith('eyJ')) {
    return NextResponse.json({ ...result, status: '❌ Env vars missing or wrong format' })
  }

  const client = createClient(url, service, { auth: { persistSession: false } })

  // Check tables
  const tables = ['categories','products','orders','order_items','reviews','reservations']
  const tableChecks: Record<string, string> = {}
  for (const t of tables) {
    const { count, error } = await client.from(t).select('*', { count: 'exact', head: true })
    tableChecks[t] = error ? `❌ ${error.message}` : `✅ ${count ?? 0} rows`
  }
  result.tables = tableChecks

  // Test rpc() — the approach all write routes now use
  const testId = crypto.randomUUID()
  const { data: rpcData, error: rpcError } = await client.rpc('create_order', {
    order_data: {
      id: testId,
      order_number: `TEST-${Date.now()}`,
      customer_name: 'Debug Test',
      customer_phone: '0000000000',
      order_type: 'takeaway',
      subtotal: 0, tax: 0, total: 0,
      items: [],
    },
  })

  if (rpcError) {
    result.rpc_test = `❌ ${rpcError.message} (code: ${rpcError.code})`

    if (rpcError.message?.includes('function') && rpcError.message?.includes('not exist')) {
      result.fix = '👉 Run supabase/functions.sql in the Supabase SQL Editor — the stored procedures are missing'
    } else {
      result.fix = '👉 Check the error above and share it'
    }

    result.status = '❌ RPC not working yet'
  } else {
    // Clean up test row
    await client.from('orders').delete().eq('id', testId)
    result.rpc_test = '✅ RPC create_order works — ordering is functional!'

    const anyEmpty = Object.values(tableChecks).some(v => v.includes('0 rows'))
    result.status  = anyEmpty
      ? '⚠️ Working — but tables are empty. Run supabase/seed.sql to load the menu.'
      : '✅ Everything working perfectly'
  }

  return NextResponse.json(result)
}
