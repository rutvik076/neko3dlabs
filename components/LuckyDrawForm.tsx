'use client'
import { useState } from 'react'
import { supabase, BUCKETS, uploadFile } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { generateFilePath } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Props { product: Product }

export default function LuckyDrawForm({ product }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', address: '', agree: false })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(s => ({ ...s, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  async function submit() {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) { alert('Please fill all required fields.'); return }
    if (!file) { alert('Please upload your subscription screenshot.'); return }
    if (!form.agree) { alert('Please agree to the terms.'); return }

    setSubmitting(true)
    try {
      // Check duplicate
      const { data: existing } = await supabase
        .from('participants').select('id').eq('product_id', product.id).eq('phone', form.phone).single()
      if (existing) { alert('This phone number has already entered this draw.'); setSubmitting(false); return }

      // Upload screenshot
      const path = generateFilePath('screenshots', file.name)
      const screenshotUrl = await uploadFile(BUCKETS.SCREENSHOTS, path, file)

      await supabase.from('participants').insert({
        product_id: product.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        screenshot_url: screenshotUrl,
        agreed_to_share: form.agree,
        status: 'pending',
      })

      setDone(true)
    } catch (err: any) {
      alert('Submission failed: ' + (err.message || 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white border-2 border-sage-300 rounded-3xl p-8 text-center">
        <div className="text-5xl mb-3 float inline-block">🎉</div>
        <h3 className="font-display text-xl font-bold text-choco-500">You're in!</h3>
        <p className="text-choco-300 mt-2 text-sm">Your entry has been submitted and is awaiting approval.<br/>Good luck! 🍀</p>
        <button onClick={() => router.push('/')} className="btn-kawaii mt-5 px-6 py-2.5 bg-blush-500 text-white text-sm inline-flex">
          Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-cream-200 rounded-3xl p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-choco-500 mb-5">
        Enter Draw: <span className="text-blush-500">{product.name}</span>
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">Full Name *</label>
          <input value={form.name} onChange={f('name')} placeholder="Your full name"
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">Phone Number *</label>
          <input value={form.phone} onChange={f('phone')} placeholder="+60123456789" type="tel"
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">Delivery Address *</label>
          <textarea value={form.address} onChange={f('address')} rows={3} placeholder="Your full delivery address..."
            className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-choco-400 mb-1.5">Subscription Screenshot *</label>
          <label className="block border-2 border-dashed border-cream-300 rounded-xl p-5 text-center cursor-pointer hover:border-blush-300 transition-colors bg-cream-50">
            <div className="text-2xl mb-1">{file ? '✅' : '📸'}</div>
            <p className="text-xs text-choco-300">{file ? file.name : 'Click to upload screenshot of your subscription'}</p>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.agree} onChange={f('agree')} className="mt-0.5 accent-blush-400 w-4 h-4 flex-shrink-0" />
          <span className="text-xs text-choco-300">I agree to share the product video on my social media if I win this lucky draw. 🐾</span>
        </label>
      </div>

      <button onClick={submit} disabled={submitting}
        className="btn-kawaii w-full mt-5 py-3.5 bg-gradient-to-r from-blush-400 to-blush-500 text-white font-semibold text-sm shadow-lg disabled:opacity-60"
        style={{ boxShadow: '0 4px 20px rgba(217,85,85,0.3)' }}>
        {submitting ? '🎲 Submitting...' : '🎲 Join Lucky Draw'}
      </button>
    </div>
  )
}
