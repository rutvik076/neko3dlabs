'use client'
import { usePathname } from 'next/navigation'

export default function FloatingButtons() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  const waNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '60123456789'
  const waUrl = `https://wa.me/${waNum}`
  const ytUrl = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com'

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-2.5">
      <a href={ytUrl} target="_blank" rel="noreferrer"
        title="Subscribe on YouTube"
        className="w-11 h-11 rounded-lg bg-red-600 text-white flex items-center justify-center text-base shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
        style={{ boxShadow: '0 4px 14px rgba(220,38,38,0.4)' }}>
        ▶
      </a>
      <a href={waUrl} target="_blank" rel="noreferrer"
        title="Chat on WhatsApp"
        className="w-11 h-11 rounded-lg bg-[#25d366] text-white flex items-center justify-center text-lg shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
        style={{ boxShadow: '0 4px 14px rgba(37,211,102,0.4)' }}>
        💬
      </a>
    </div>
  )
}
