'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function YTPopup() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    const seen = sessionStorage.getItem('yt-popup')
    if (!seen) {
      const t = setTimeout(() => setShow(true), 4000)
      return () => clearTimeout(t)
    }
  }, [pathname])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem('yt-popup', '1')
  }

  if (!show) return null

  const ytUrl = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com'

  return (
    <div className="fixed bottom-24 right-4 z-50 w-64 bg-graphite-800 border border-graphite-600 rounded-xl p-4 shadow-2xl toast-enter">
      <button onClick={dismiss}
        className="absolute top-3 right-3 text-graphite-300 hover:text-white text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-graphite-600 transition-colors">
        ✕
      </button>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">▶</div>
        <div>
          <h3 className="font-semibold text-white text-sm leading-tight">Follow on YouTube</h3>
          <p className="text-xs text-graphite-300 mt-1 leading-relaxed">Get notified about new products and lucky draws!</p>
          <a href={ytUrl} target="_blank" rel="noreferrer" onClick={dismiss}
            className="btn-tech mt-3 px-4 py-2 bg-red-600 text-white text-xs inline-flex font-semibold hover:bg-red-700">
            ▶ Subscribe Free
          </a>
        </div>
      </div>
    </div>
  )
}
