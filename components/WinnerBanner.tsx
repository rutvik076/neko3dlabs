import { supabase } from '@/lib/supabase'

export default async function WinnerBanner() {
  const sb = supabase as any
  const { data: settings } = await sb
    .from('settings')
    .select('banner_enabled, banner_text')
    .eq('id', 1)
    .single()

  if (!settings?.banner_enabled || !settings?.banner_text) return null

  return (
    <div className="bg-blue-600 text-white text-xs font-semibold text-center py-2 px-4 tracking-wide">
      <span className="mr-2">🏆</span>
      {settings.banner_text}
    </div>
  )
}
