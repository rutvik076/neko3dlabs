import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/HeroSection'

export const revalidate = 60

export default async function HomePage() {
  const sb = supabase as any
  const { data: products } = await sb
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const all = (products as Product[]) || []
  const featured = all.filter((p: Product) => p.is_featured)
  const rest = all.filter((p: Product) => !p.is_featured)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <HeroSection />

      {featured.length > 0 && (
        <section className="mb-10 fade-up">
          <div className="flex items-center gap-4 mb-5">
            <div className="accent-line" />
            <h2 className="font-display text-xl font-bold text-graphite-700 tracking-tight">Featured Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p: Product, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
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
            <div className="w-16 h-16 mx-auto mb-4 bg-steel-100 rounded-xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-steel-400">
                <rect x="4" y="10" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M4 15l12-6 12 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="11" y="19" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <p className="text-steel-400 font-medium">No products yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(rest.length > 0 ? rest : all).map((p: Product, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
