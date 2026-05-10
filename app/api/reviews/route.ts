import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  try {
    const { data, error } = await sb()
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(12)
    if (error) throw error
    return NextResponse.json({ reviews: data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customer_name, rating, comment } = await request.json()
    if (!customer_name || !rating)
      return NextResponse.json({ error: 'Name and rating required' }, { status: 400 })

    const { data, error } = await sb().rpc('submit_review', {
      p_customer_name: customer_name,
      p_rating:        parseInt(rating),
      p_comment:       comment || null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ review: data, message: 'Review submitted — pending approval' }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
