import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { product_id, product_name, buyer_phone } = await req.json()
  if (!product_name || !buyer_phone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const admin = createAdminClient()
  const { error } = await admin.from('orders').insert({
    product_id: product_id || null,
    product_name,
    buyer_phone,
    status: 'pending',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
