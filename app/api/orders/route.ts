import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { product_id, product_name, buyer_phone } = await req.json()
  if (!product_name || !buyer_phone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  try {
    // Lazy-load Admin SDK so it only initialises on first real request, not at build time
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore }                 = await import('firebase-admin/firestore')

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
        }),
      })
    }

    await getFirestore().collection('orders').add({
      product_id:   product_id || null,
      product_name,
      buyer_phone,
      status:       'pending',
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
