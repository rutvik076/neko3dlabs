'use client'
import { useRouter } from 'next/navigation'

interface Props { productId: string; productName: string }

export default function LuckyDrawButton({ productId }: Props) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/lucky?product=${productId}`)}
      className="btn-kawaii w-full py-4 bg-gradient-to-r from-blush-400 to-blush-500 text-white text-base shadow-lg hover:shadow-xl"
      style={{ boxShadow: '0 4px 20px rgba(217,85,85,0.35)' }}>
      🎲 Join Lucky Draw
    </button>
  )
}
