import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import LuckyDrawForm from '@/components/LuckyDrawForm'
import Link from 'next/link'

export const revalidate = 60

interface Props { searchParams: { product?: string } }

export default async function LuckyPage({ searchParams }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: products } = await sb
    .from('products')
    .select('*')
    .eq('type', 'LUCKY_DRAW')
    .eq('stock', 'in')
    .order('created_at', { ascending: false })

  const draws = (products as Product[]) || []
  const ytUrl = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com'
  const selectedId = searchParams.product

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
      <div className="text-center mb-8 fade-up">
        <div className="text-5xl mb-3 float inline-block">🎁</div>
        <h1 className="font-display text-3xl font-bold text-choco-500">Lucky Draw</h1>
        <p className="text-choco-300 mt-2">Follow the steps below to enter and win free 3D prints!</p>
      </div>

      <div className="space-y-3 mb-10 fade-up fade-up-1">
        {[
          { n: '01', title: 'Subscribe', desc: 'Subscribe to our YouTube channel.', href: ytUrl, cta: 'Subscribe Now →' },
          { n: '02', title: 'Like & Share', desc: 'Like and share the product video on your social media.' },
          { n: '03', title: 'Screenshot Proof', desc: 'Take a screenshot showing your subscription.' },
          { n: '04', title: 'Fill the Form', desc: 'Complete the registration form below to enter the draw.' },
        ].map(s => (
          <div key={s.n} className="flex gap-4 items-start bg-white rounded-2xl p-4 shadow-sm border border-cream-200">
            <div className="min-w-[40px] h-10 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 flex items-center justify-center text-white font-bold text-sm">
              {s.n}
            </div>
            <div>
              <h3 className="font-semibold text-choco-500">{s.title}</h3>
              <p className="text-sm text-choco-300 mt-0.5">{s.desc}</p>
              {s.href && <a href={s.href} target="_blank" rel="noreferrer" className="text-blush-500 text-sm font-semibold mt-1 inline-block hover:underline">{s.cta}</a>}
            </div>
          </div>
        ))}
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-choco-300">No active lucky draws right now. Check back soon! 🐱</p>
          <Link href="/" className="text-blush-500 font-semibold text-sm mt-3 inline-block">← Back to Shop</Link>
        </div>
      ) : (
        <div className="fade-up fade-up-2">
          <h2 className="font-display text-xl font-bold text-choco-500 mb-4">Active Lucky Draws</h2>
          <div className="space-y-3 mb-8">
            {draws.map((p: Product) => (
              <Link key={p.id} href={`/lucky?product=${p.id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedId === p.id ? 'border-blush-400 bg-blush-100/50' : 'border-cream-200 bg-white hover:border-blush-300'}`}>
                <div className="w-14 h-14 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-choco-500 truncate">{p.name}</h3>
                  {p.lucky_draw_end && <p className="text-xs text-choco-300 mt-0.5">Ends {new Date(p.lucky_draw_end).toLocaleDateString('en-MY')}</p>}
                </div>
                <span className="text-blush-500 font-bold text-sm">Enter →</span>
              </Link>
            ))}
          </div>
          {selectedId && draws.find((p: Product) => p.id === selectedId) && (
            <LuckyDrawForm product={draws.find((p: Product) => p.id === selectedId)!} />
          )}
        </div>
      )}
    </div>
  )
}
