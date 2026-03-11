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
  const { data: product } = await supabase
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

  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', p.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <Link href="/" className="inline-flex items-center gap-2 text-choco-300 hover:text-choco-500 text-sm mb-6 transition-colors">
        ← Back to Shop
      </Link>

      <div className="grid md:grid-cols-[1fr_0.618fr] gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-3xl overflow-hidden bg-cream-100 sticker-border relative">
            {p.images?.[0] ? (
              <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
            )}
            <div className={`ribbon ${p.type === 'LUCKY_DRAW' ? 'bg-gradient-to-r from-pink-400 to-pink-500' : ''}`}>
              {p.type === 'LUCKY_DRAW' ? '🎲 Free Draw' : '🛒 Buy Now'}
            </div>
          </div>

          {/* Thumbnail strip */}
          {p.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {p.images.slice(1).map((img, i) => (
                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 border-2 border-cream-200">
                  <Image src={img} alt={`${p.name} ${i+2}`} width={64} height={64} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}

          {/* Video */}
          {ytId && (
            <div className="mt-4 rounded-2xl overflow-hidden aspect-video">
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
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${p.type === 'LUCKY_DRAW' ? 'tag-lucky' : 'tag-sell'}`}>
            {p.type === 'LUCKY_DRAW' ? '🎲 Free Lucky Draw' : '🛒 For Sale'}
          </span>

          <h1 className="font-display text-3xl font-bold text-choco-500 leading-tight">{p.name}</h1>

          {p.type === 'SELL' ? (
            <div className="text-3xl font-bold text-blush-500 mt-3">{formatPrice(p.price)}</div>
          ) : (
            <div className="text-3xl font-bold text-sage-400 mt-3">FREE 🎁</div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${p.stock === 'in' ? 'bg-sage-400' : 'bg-red-400'}`} />
            <span className="text-sm text-choco-300">{p.stock === 'in' ? 'In Stock' : 'Out of Stock'}</span>
          </div>

          {p.type === 'LUCKY_DRAW' && (
            <div className="mt-3 space-y-1 text-sm text-choco-300">
              {count !== null && (
                <p>👥 <strong className="text-choco-500">{count}</strong>{p.max_participants ? `/${p.max_participants}` : ''} entries</p>
              )}
              {p.lucky_draw_end && (
                <p>🗓 Draw ends: <strong className="text-choco-500">{new Date(p.lucky_draw_end).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
              )}
            </div>
          )}

          <div className="h-px bg-cream-200 my-5" />

          <p className="text-choco-300 leading-relaxed text-sm">{p.description}</p>

          <div className="mt-6">
            {p.stock !== 'in' ? (
              <button disabled className="btn-kawaii w-full py-4 bg-cream-200 text-choco-300 cursor-not-allowed text-base">
                Out of Stock
              </button>
            ) : p.type === 'SELL' ? (
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="btn-kawaii w-full py-4 bg-[#25d366] text-white text-base block text-center shadow-lg hover:shadow-xl"
                style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
                💬 Buy on WhatsApp
              </a>
            ) : (
              <LuckyDrawButton productId={p.id} productName={p.name} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
