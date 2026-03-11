import { supabase } from '@/lib/supabase'

export default async function WinnerBanner() {
  const { data: settings } = await supabase.from('settings').select('banner_enabled, banner_text').eq('id', 1).single()
  if (!settings?.banner_enabled || !settings?.banner_text) return null

  return (
    <div className="bg-gradient-to-r from-blush-400 via-gold-300 to-blush-400 text-choco-500 text-sm font-semibold text-center py-2.5 px-4 animate-shimmer"
      style={{ backgroundSize: '200% 100%' }}>
      {settings.banner_text}
    </div>
  )
}
