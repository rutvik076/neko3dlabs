'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Settings } from '@/lib/types'

export default function AdminSettings() {
  const [form, setForm] = useState<Partial<Settings>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  useEffect(() => {
    sb.from('settings').select('*').eq('id', 1).single()
      .then(({ data }: { data: Settings | null }) => { if (data) setForm(data) })
  }, [])

  async function save() {
    setSaving(true)
    await sb.from('settings').update({
      youtube_url: form.youtube_url,
      whatsapp_number: form.whatsapp_number,
      site_name: form.site_name,
      banner_text: form.banner_text,
      banner_enabled: form.banner_enabled,
    }).eq('id', 1)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleField = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [key]: e.target.value }))

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold text-choco-500 mb-6">Settings ⚙️</h1>

      <div className="bg-white rounded-2xl border border-cream-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">Site Name</label>
          <input value={form.site_name || ''} onChange={handleField('site_name')}
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">YouTube Channel URL</label>
          <input value={form.youtube_url || ''} onChange={handleField('youtube_url')}
            placeholder="https://youtube.com/@neko3dlabs"
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">WhatsApp Number (with country code, no +)</label>
          <input value={form.whatsapp_number || ''} onChange={handleField('whatsapp_number')}
            placeholder="60123456789"
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
        </div>
        <div className="pt-2 border-t border-cream-200">
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">Winner Banner Text (optional)</label>
          <input value={form.banner_text || ''} onChange={handleField('banner_text')}
            placeholder="🏆 Congrats to our latest winner!"
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="banner_en" checked={form.banner_enabled || false}
              onChange={e => setForm(s => ({ ...s, banner_enabled: e.target.checked }))}
              className="accent-blush-400 w-4 h-4" />
            <label htmlFor="banner_en" className="text-sm text-choco-400 cursor-pointer">Enable banner</label>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="btn-kawaii w-full py-3 bg-blush-500 text-white font-semibold text-sm hover:bg-blush-400 disabled:opacity-60 shadow-md">
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="mt-6 bg-cream-50 border border-cream-200 rounded-2xl p-5">
        <h2 className="font-semibold text-choco-500 mb-3 text-sm">📦 Supabase Storage Buckets Needed</h2>
        <ul className="space-y-1 text-xs">
          {[
            { name: 'product-images', pub: true },
            { name: 'product-videos', pub: true },
            { name: 'screenshots', pub: false },
            { name: 'shipping-proofs', pub: false },
          ].map(b => (
            <li key={b.name} className="flex items-center gap-2">
              <code className="bg-white border border-cream-200 px-2 py-0.5 rounded text-choco-500">{b.name}</code>
              <span className={`text-xs px-1.5 py-0.5 rounded ${b.pub ? 'tag-approved' : 'tag-pending'}`}>{b.pub ? 'Public' : 'Private'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
