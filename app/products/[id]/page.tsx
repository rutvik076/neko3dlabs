import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { notFound } from 'next/navigation'
import { formatPrice, buildWhatsAppUrl, extractYouTubeId } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import LuckyDrawButton from '@/components/LuckyDrawButton'

export const revalidate = 60

interface Props { params: { id: string } }

export default async function ProductPage({ params }: Props) {
  const sb = supabase as any

  const { data: product } = await sb
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()
  const p = product as Product

  const waUrl = buildWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '60123456789',
    p.name
  )
  const ytId = p.video_url ? extractYouTubeId(p.video_url) : null

  const { count } = await sb
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', p.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <Link href="/" className="inline-flex items-center gap-2 text-steel-500 hover:text-blue-600 text-sm mb-6 transition-colors font-medium">
        ← Back to Shop
      </Link>

      <div className="grid md:grid-cols-[1fr_420px] gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-steel-100 img-frame relative">
            {p.images?.[0] ? (
              <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-steel-300">
                  <rect x="8" y="20" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 30l24-12 24 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <rect x="24" y="38" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
            )}
            <div className={`ribbon ${p.type === 'LUCKY_DRAW' ? 'ribbon-orange' : ''}`}>
              {p.type === 'LUCKY_DRAW' ? 'FREE DRAW' : 'BUY NOW'}
            </div>
          </div>

          {p.images?.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {p.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-steel-100 border border-steel-200">
                  <Image src={img} alt={`${p.name} ${i + 2}`} width={64} height={64} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}

          {ytId && (
            <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-steel-200">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="w-full h-full"
                allowFullScreen
                title={`${p.name} video`}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="fade-up">
          {/* Type badge */}
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-md mb-4 uppercase tracking-wide ${p.type === 'LUCKY_DRAW' ? 'tag-lucky' : 'tag-sell'}`}>
            {p.type === 'LUCKY_DRAW' ? '🎲 Free Lucky Draw' : '🛍 For Sale'}
          </span>

          <h1 className="font-display text-3xl font-bold text-graphite-700 leading-tight tracking-tight">{p.name}</h1>

          {/* Price */}
          {p.type === 'SELL' ? (
            <div className="mt-3">
              <span className="text-3xl font-bold text-blue-600 font-display">{formatPrice(p.price)}</span>
              <span className="text-sm text-steel-400 ml-2 font-medium">INR</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-3xl font-bold text-orange-500 font-display">FREE</span>
              <span className="text-sm text-orange-400 font-medium">Lucky Draw Entry</span>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mt-3">
            <div className={`w-2 h-2 rounded-full pulse-dot ${p.stock === 'in' ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-sm text-steel-500 font-medium">{p.stock === 'in' ? 'In Stock' : 'Out of Stock'}</span>
          </div>

          {/* Lucky draw meta */}
          {p.type === 'LUCKY_DRAW' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-1.5">
              {count !== null && (
                <p className="text-sm text-orange-700">
                  👥 <strong>{count}</strong>{p.max_participants ? `/${p.max_participants}` : ''} entries
                </p>
              )}
              {p.lucky_draw_end && (
                <p className="text-sm text-orange-700">
                  🗓 Draw closes: <strong>{new Date(p.lucky_draw_end).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </p>
              )}
            </div>
          )}

          <div className="h-px bg-steel-200 my-5" />
          <p className="text-steel-600 leading-relaxed text-sm">{p.description}</p>

          <div className="mt-6 space-y-3">
            {p.stock !== 'in' ? (
              <button disabled className="btn-tech w-full py-4 bg-steel-100 text-steel-400 cursor-not-allowed text-base border border-steel-200">
                Out of Stock
              </button>
            ) : p.type === 'SELL' ? (
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="btn-tech w-full py-4 bg-[#25d366] text-white text-base block text-center font-semibold"
                style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}>
                💬 Buy on WhatsApp
              </a>
            ) : (
              <LuckyDrawButton productId={p.id} productName={p.name} />
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              {['3D Printed', 'Quality Check', 'Fast Ship'].map(tag => (
                <div key={tag} className="text-center py-2 bg-steel-50 border border-steel-200 rounded-lg">
                  <p className="text-xs text-steel-500 font-medium">{tag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
