'use client'
import { usePathname } from 'next/navigation'

export default function FloatingButtons() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  const waNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '60123456789'
  const waUrl = `https://wa.me/${waNum}`
  const ytUrl = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com'

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3">
      <a href={ytUrl} target="_blank" rel="noreferrer"
        className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-lg shadow-xl hover:scale-110 transition-transform"
        title="Subscribe on YouTube"
        style={{ boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}>
        ▶
      </a>
      <a href={waUrl} target="_blank" rel="noreferrer"
        className="w-12 h-12 rounded-full bg-[#25d366] text-white flex items-center justify-center text-xl shadow-xl hover:scale-110 transition-transform"
        title="Chat on WhatsApp"
        style={{ boxShadow: '0 4px 16px rgba(37,211,102,0.4)' }}>
        💬
      </a>
    </div>
  )
}
