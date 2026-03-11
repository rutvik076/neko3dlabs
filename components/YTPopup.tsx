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
    <div className="fixed bottom-24 right-4 z-50 w-64 bg-white border border-cream-200 rounded-2xl p-4 shadow-2xl toast-enter">
      <button onClick={dismiss} className="absolute top-3 right-3 text-choco-300 hover:text-choco-500 text-sm w-5 h-5 flex items-center justify-center">✕</button>
      <div className="flex items-start gap-3">
        <div className="text-2xl">🎥</div>
        <div>
          <h3 className="font-semibold text-choco-500 text-sm leading-tight">Join our YouTube!</h3>
          <p className="text-xs text-choco-300 mt-1">Subscribe & never miss a new product or lucky draw!</p>
          <a href={ytUrl} target="_blank" rel="noreferrer" onClick={dismiss}
            className="btn-kawaii mt-3 px-4 py-2 bg-red-500 text-white text-xs inline-flex font-semibold hover:bg-red-600">
            ▶ Subscribe Free
          </a>
        </div>
      </div>
    </div>
  )
}
