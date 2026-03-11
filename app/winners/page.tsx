import { supabase } from '@/lib/supabase'
import type { Winner, Product } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function WinnersPage() {
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
      <div className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="accent-line" />
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Hall of Fame</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-graphite-700 tracking-tight">Lucky Draw Winners</h1>
        <p className="text-steel-500 mt-2">Congratulations to all our lucky winners!</p>
      </div>

      {ws.length === 0 ? (
        <div className="card-tech text-center py-16 fade-up fade-up-1">
          <div className="w-14 h-14 mx-auto mb-4 bg-steel-100 rounded-xl flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
          <p className="text-graphite-600 font-semibold">No winners announced yet.</p>
          <p className="text-sm text-steel-400 mt-1">Stay tuned for our upcoming lucky draws!</p>
        </div>
      ) : (
        <div className="space-y-3 fade-up fade-up-1">
          {ws.map((w: Winner, i: number) => {
            const product = productMap[w.product_id || '']
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={w.id} className="card-tech card-hover p-4 flex items-center gap-4">
                <div className="text-2xl w-8 text-center flex-shrink-0">
                  {i < 3 ? medals[i] : '🏅'}
                </div>
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-steel-100 flex-shrink-0 border border-steel-200">
                  {product?.images?.[0]
                    ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-graphite-700 truncate">{w.winner_name}</h3>
                  <p className="text-sm text-steel-500 mt-0.5 truncate">
                    Won: <span className="text-graphite-600 font-medium">{product?.name || 'Product'}</span>
                  </p>
                  <p className="text-xs text-steel-400 mt-0.5">📅 {formatDate(w.announce_date)}</p>
                </div>
                {w.shipping_proof_url && (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-1 rounded-md flex-shrink-0">
                    ✓ Shipped
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
