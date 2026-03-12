import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface Props { product: Product; index?: number }

export default function ProductCard({ product: p, index = 0 }: Props) {
  return (
    <Link
      href={`/products/${p.id}`}
      className="card-hover block bg-white rounded-xl border border-steel-200 overflow-hidden group relative"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Image container — explicit relative + overflow for next/image fill */}
      <div className="aspect-square bg-steel-100 overflow-hidden relative">
        {p.images?.[0] ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-steel-100">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-steel-300">
              <rect x="8" y="16" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M8 22l16-8 16 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <rect x="18" y="28" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        )}

        {/* Type ribbon */}
        <div className={`ribbon ${p.type === 'LUCKY_DRAW' ? 'ribbon-orange' : ''}`}>
          {p.type === 'LUCKY_DRAW' ? 'FREE DRAW' : 'BUY NOW'}
        </div>

        {/* Out of stock overlay */}
        {p.stock !== 'in' && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="bg-white text-steel-500 font-semibold text-xs px-3 py-1.5 rounded-md border border-steel-300 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="font-semibold text-graphite-700 text-sm leading-tight truncate">{p.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-sm font-bold ${p.type === 'LUCKY_DRAW' ? 'text-orange-500' : 'text-blue-600'}`}>
            {p.type === 'LUCKY_DRAW' ? 'FREE' : formatPrice(p.price)}
          </span>
          {p.is_featured && (
            <span className="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-1.5 py-0.5 rounded font-semibold">
              Featured
            </span>
          )}
        </div>
        <div className="mt-2.5 w-full py-1.5 bg-steel-50 border border-steel-200 rounded-md text-xs font-medium text-steel-500 text-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white transition-all duration-200">
          View Details →
        </div>
      </div>
    </Link>
  )
}
