'use client'
import { useEffect, useState } from 'react'
import { getAll, orderBy } from '@/lib/firebase'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/HeroSection'

export default function HomePage() {
  const [all, setAll]         = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAll<Product>('products', [orderBy('created_at', 'desc')])
      .then(data => { setAll(data); setLoading(false) })
  }, [])

  const featured = all.filter(p => p.is_featured)
  const rest      = all.filter(p => !p.is_featured)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <HeroSection />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-steel-100 aspect-square animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mb-10 fade-up">
              <div className="flex items-center gap-4 mb-5">
                <div className="accent-line" />
                <h2 className="font-display text-xl font-bold text-graphite-700 tracking-tight">Featured Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </section>
          )}

          <section className="fade-up fade-up-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="accent-line" />
              <h2 className="font-display text-xl font-bold text-graphite-700 tracking-tight">All Products</h2>
              <span className="text-sm text-steel-400 font-medium">{all.length} items</span>
            </div>
            {all.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-steel-200">
                <p className="text-steel-400 font-medium">No products yet — check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(rest.length > 0 ? rest : all).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
