import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import LuckyDrawForm from '@/components/LuckyDrawForm'
import Link from 'next/link'

export const revalidate = 60

interface Props { searchParams: { product?: string } }

export default async function LuckyPage({ searchParams }: Props) {
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

  const steps = [
    { n: '01', title: 'Subscribe', desc: 'Subscribe to our YouTube channel to be eligible.', href: ytUrl, cta: 'Subscribe Now →' },
    { n: '02', title: 'Like & Share', desc: 'Like the product video and share it on your social media.' },
    { n: '03', title: 'Screenshot', desc: 'Take a screenshot clearly showing your subscription.' },
    { n: '04', title: 'Register', desc: 'Fill the form below with your details and upload proof.' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
      {/* Header */}
      <div className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="accent-line" />
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Free Lucky Draw</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-graphite-700 tracking-tight">Win 3D Prints — FREE</h1>
        <p className="text-steel-500 mt-2">Follow the steps below to enter and win premium 3D printed products.</p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 fade-up fade-up-1">
        {steps.map(s => (
          <div key={s.n} className="card-tech p-4 flex gap-3 items-start">
            <div className="min-w-[36px] h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-wide flex-shrink-0">
              {s.n}
            </div>
            <div>
              <h3 className="font-semibold text-graphite-700 text-sm">{s.title}</h3>
              <p className="text-xs text-steel-500 mt-0.5 leading-relaxed">{s.desc}</p>
              {s.href && (
                <a href={s.href} target="_blank" rel="noreferrer"
                  className="text-blue-600 text-xs font-semibold mt-1.5 inline-block hover:underline">
                  {s.cta}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {draws.length === 0 ? (
        <div className="card-tech text-center py-12 fade-up fade-up-2">
          <div className="w-12 h-12 mx-auto mb-3 bg-steel-100 rounded-xl flex items-center justify-center text-2xl">🎁</div>
          <p className="text-steel-500 font-medium">No active lucky draws right now.</p>
          <p className="text-sm text-steel-400 mt-1">Check back soon or browse products!</p>
          <Link href="/" className="btn-tech btn-primary inline-flex mt-4 px-5 py-2.5 text-sm">
            ← Browse Products
          </Link>
        </div>
      ) : (
        <div className="fade-up fade-up-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="accent-line" />
            <h2 className="font-display text-lg font-bold text-graphite-700">Active Draws</h2>
          </div>
          <div className="space-y-3 mb-8">
            {draws.map((p: Product) => (
              <Link key={p.id} href={`/lucky?product=${p.id}`}
                className={`card-hover flex items-center gap-4 p-4 rounded-xl border-2 transition-all bg-white
                  ${selectedId === p.id
                    ? 'border-orange-400 shadow-orange-glow'
                    : 'border-steel-200 hover:border-blue-300'}`}>
                <div className="w-14 h-14 rounded-lg bg-steel-100 overflow-hidden flex-shrink-0 border border-steel-200">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl text-steel-300">🎁</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-graphite-700 truncate">{p.name}</h3>
                  {p.lucky_draw_end && (
                    <p className="text-xs text-steel-400 mt-0.5">
                      Ends {new Date(p.lucky_draw_end).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <span className="text-orange-500 font-bold text-sm flex-shrink-0">Enter →</span>
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
