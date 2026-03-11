'use client'
import { useRouter } from 'next/navigation'

interface Props { productId: string; productName: string }

export default function LuckyDrawButton({ productId }: Props) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/lucky?product=${productId}`)}
      className="btn-tech btn-accent w-full py-4 text-base font-semibold shadow-orange-glow">
      🎲 Join Lucky Draw — FREE
    </button>
  )
}
