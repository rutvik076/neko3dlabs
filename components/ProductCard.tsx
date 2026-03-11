import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface Props { product: Product; index?: number }

export default function ProductCard({ product: p, index = 0 }: Props) {
  return (
    <Link href={`/products/${p.id}`}
      className="card-hover block bg-white rounded-3xl border border-cream-200 overflow-hidden group relative"
      style={{ animationDelay: `${index * 0.05}s` }}>

      {/* Image */}
      <div className="aspect-square bg-cream-100 overflow-hidden relative">
        {p.images?.[0] ? (
          <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {/* Ribbon */}
        <div className={`ribbon ${p.type === 'LUCKY_DRAW' ? '!bg-gradient-to-r !from-pink-400 !to-rose-500' : ''}`}>
          {p.type === 'LUCKY_DRAW' ? '🎲 Free' : '🛒 Buy'}
        </div>
        {p.stock !== 'in' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-100 text-red-500 font-bold text-xs px-3 py-1.5 rounded-full border border-red-200">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="font-semibold text-choco-500 text-sm leading-tight truncate">{p.name}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className={`text-sm font-bold ${p.type === 'LUCKY_DRAW' ? 'text-sage-400' : 'text-blush-500'}`}>
            {p.type === 'LUCKY_DRAW' ? 'FREE 🎁' : formatPrice(p.price)}
          </span>
          {p.is_featured && <span className="text-xs text-gold-400">⭐</span>}
        </div>
      </div>
    </Link>
  )
}
