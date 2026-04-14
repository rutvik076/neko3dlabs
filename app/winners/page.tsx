'use client'
import { useEffect, useState } from 'react'
import { getAll, where, orderBy } from '@/lib/firebase'
import type { Winner, Product } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function WinnersPage() {
  const [winners,    setWinners]    = useState<Winner[]>([])
  const [productMap, setProductMap] = useState<Record<string, Partial<Product>>>({})
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      getAll<Winner>('winners',   [where('is_published', '==', true), orderBy('created_at', 'desc')]),
      getAll<Product>('products', []),
    ]).then(([ws, ps]) => {
      setWinners(ws)
      setProductMap(Object.fromEntries(ps.map(p => [p.id, p])))
      setLoading(false)
    })
  }, [])

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

      {loading ? (
        <div className="card-tech p-8 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : winners.length === 0 ? (
        <div className="card-tech text-center py-16 fade-up fade-up-1">
          <span className="text-3xl">🏆</span>
          <p className="text-graphite-600 font-semibold mt-3">No winners announced yet.</p>
          <p className="text-sm text-steel-400 mt-1">Stay tuned for our upcoming lucky draws!</p>
        </div>
      ) : (
        <div className="space-y-3 fade-up fade-up-1">
          {winners.map((w, i) => {
            const product = productMap[w.product_id || '']
            const medals  = ['🥇', '🥈', '🥉']
            return (
              <div key={w.id} className="card-tech card-hover p-4 flex items-center gap-4">
                <div className="text-2xl w-8 text-center flex-shrink-0">{i < 3 ? medals[i] : '🏅'}</div>
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
