import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/HeroSection'

export const revalidate = 60

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-display text-2xl font-bold text-choco-500">✨ Featured</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blush-300 to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p: Product, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-display text-2xl font-bold text-choco-500">🛒 All Products</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-blush-300 to-transparent" />
        </div>
        {all.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 float inline-block">🐱</div>
            <p className="text-choco-300 font-body">No products yet — check back soon!</p>
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
