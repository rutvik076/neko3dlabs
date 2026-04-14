'use client'
import { useEffect, useState } from 'react'
import { getOne } from '@/lib/firebase'
import type { Settings } from '@/lib/types'

export default function WinnerBanner() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    getOne<Settings>('settings', 'main').then(setSettings)
  }, [])

  if (!settings?.banner_enabled || !settings?.banner_text) return null

  return (
    <div className="bg-blue-600 text-white text-xs font-semibold text-center py-2 px-4 tracking-wide">
      <span className="mr-2">🏆</span>
      {settings.banner_text}
    </div>
  )
}
