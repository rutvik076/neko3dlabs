import { supabase } from '@/lib/supabase'
import type { Winner, Product } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function WinnersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: winners } = await sb
    .from('winners')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const { data: products } = await sb.from('products').select('id, name, images')

  const ws = (winners as Winner[]) || []
  const ps = (products as Partial<Product>[]) || []
  const productMap = Object.fromEntries(ps.map((p: Partial<Product>) => [p.id!, p]))

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
      <div className="text-center mb-8 fade-up">
        <div className="text-5xl mb-3 float inline-block">🏆</div>
        <h1 className="font-display text-3xl font-bold text-choco-500">Lucky Draw Winners</h1>
        <p className="text-choco-300 mt-2">Congratulations to all our lucky winners!</p>
      </div>

      {ws.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎀</div>
          <p className="text-choco-300">No winners announced yet.</p>
          <p className="text-sm text-choco-300 mt-1">Stay tuned for our upcoming lucky draws!</p>
        </div>
      ) : (
        <div className="space-y-4 fade-up fade-up-1">
          {ws.map((w: Winner, i: number) => {
            const product = productMap[w.product_id || '']
            return (
              <div key={w.id} className="bg-white border border-cream-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 card-hover relative overflow-hidden">
                <div className="absolute inset-0 paw-bg opacity-30 pointer-events-none" />
                <div className="text-3xl">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}
                </div>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                  {product?.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 relative">
                  <h3 className="font-bold text-choco-500 truncate">{w.winner_name}</h3>
                  <p className="text-sm text-choco-300 mt-0.5 truncate">Won: <span className="text-choco-400 font-medium">{product?.name || 'Product'}</span></p>
                  <p className="text-xs text-choco-300 mt-0.5">📅 {formatDate(w.announce_date)}</p>
                  {w.shipping_proof_url && (
                    <span className="text-xs text-sage-400 font-semibold mt-1 inline-block">✅ Shipped</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
