import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .order('display_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ categories: data })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
