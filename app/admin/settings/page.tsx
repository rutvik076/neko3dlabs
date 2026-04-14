'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import type { Settings } from '@/lib/types'

export default function AdminSettings() {
  const [form,   setForm]   = useState<Partial<Settings>>({})
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'main')).then(snap => {
      if (snap.exists()) setForm(snap.data() as Settings)
    })
  }, [])

  async function save() {
    setSaving(true)
    await setDoc(doc(db, 'settings', 'main'), {
      youtube_url:     form.youtube_url     || '',
      whatsapp_number: form.whatsapp_number || '',
      site_name:       form.site_name       || 'Neko3DLabs',
      banner_text:     form.banner_text     || '',
      banner_enabled:  form.banner_enabled  || false,
      updated_at:      serverTimestamp(),
    }, { merge: true })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleField = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [key]: e.target.value }))

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-graphite-700 tracking-tight">Settings</h1>
        <p className="text-steel-500 text-sm mt-1">Configure your store settings.</p>
      </div>
      <div className="card-tech p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Site Name</label>
          <input value={form.site_name||''} onChange={handleField('site_name')} className="input-tech" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">YouTube Channel URL</label>
          <input value={form.youtube_url||''} onChange={handleField('youtube_url')}
            placeholder="https://youtube.com/@neko3dlabs" className="input-tech" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">WhatsApp Number (with country code, no +)</label>
          <input value={form.whatsapp_number||''} onChange={handleField('whatsapp_number')}
            placeholder="919876543210" className="input-tech" />
        </div>
        <div className="pt-4 border-t border-steel-200">
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Winner Banner Text</label>
          <input value={form.banner_text||''} onChange={handleField('banner_text')}
            placeholder="🏆 Congrats to our latest winner!" className="input-tech" />
          <div className="flex items-center gap-2 mt-3 p-3 bg-steel-50 rounded-lg border border-steel-200">
            <input type="checkbox" id="banner_en" checked={form.banner_enabled||false}
              onChange={e => setForm(s=>({...s, banner_enabled:e.target.checked}))} className="accent-blue-500 w-4 h-4" />
            <label htmlFor="banner_en" className="text-sm text-steel-600 cursor-pointer font-medium">Enable banner on site</label>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="btn-tech btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="mt-6 card-tech p-5">
        <h2 className="font-semibold text-graphite-700 mb-3 text-sm">Firebase Storage Folders</h2>
        <div className="space-y-2">
          {[
            { name: 'product-images',  pub: true  },
            { name: 'product-videos',  pub: true  },
            { name: 'screenshots',     pub: true  },
            { name: 'shipping-proofs', pub: false },
          ].map(b => (
            <div key={b.name} className="flex items-center gap-2">
              <code className="bg-steel-100 border border-steel-200 px-2 py-1 rounded text-xs text-graphite-600 font-mono">{b.name}</code>
              <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${b.pub ? 'tag-approved' : 'tag-pending'}`}>
                {b.pub ? 'Public read' : 'Auth only'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
