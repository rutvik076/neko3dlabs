'use client'
import { useState } from 'react'
import { supabase, BUCKETS, uploadFile } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { generateFilePath } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Props { product: Product }
type Step = 'idle' | 'checking' | 'uploading' | 'saving' | 'done'

export default function LuckyDrawForm({ product }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', address: '', agree: false })
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState('')
  const sb = supabase as any

  const handleField = (k: 'name' | 'phone' | 'address') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(s => ({ ...s, [k]: e.target.value }))

  const stepLabel: Record<Step, string> = {
    idle:      '🎲 Submit Entry — FREE',
    checking:  'Checking...',
    uploading: 'Uploading screenshot...',
    saving:    'Saving entry...',
    done:      'Done!',
  }

  async function submit() {
    setError('')

    // ── Client validation
    if (!form.name.trim())    { setError('Please enter your full name.'); return }
    if (!form.phone.trim())   { setError('Please enter your phone number.'); return }
    if (!form.address.trim()) { setError('Please enter your delivery address.'); return }
    if (!file)                { setError('Please upload your subscription screenshot.'); return }
    if (!form.agree)          { setError('Please agree to the terms to continue.'); return }

    try {
      setStep('checking')

      // ── Layer 2: Browser/device fingerprint check
      // Prevents same browser from entering twice even with a different phone number
      const deviceKey = `entered_draw_${product.id}`
      if (typeof window !== 'undefined' && localStorage.getItem(deviceKey)) {
        setError('You have already entered this draw from this device.')
        setStep('idle')
        return
      }

      // ── Layer 1: Phone number duplicate check (backed by DB unique index)
      const { data: existing } = await sb
        .from('participants')
        .select('id')
        .eq('product_id', product.id)
        .eq('phone', form.phone.trim())
        .maybeSingle()   // returns null if not found — never throws

      if (existing) {
        setError('This phone number has already entered this draw.')
        setStep('idle')
        return
      }

      // ── Upload screenshot
      setStep('uploading')
      const path = generateFilePath('screenshots', file.name)
      let screenshotUrl = ''
      try {
        screenshotUrl = await uploadFile(BUCKETS.SCREENSHOTS, path, file)
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr)
        if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('403')) {
          throw new Error(
            'Screenshot upload blocked by storage policy. ' +
            'Please run the latest schema.sql in your Supabase SQL Editor.'
          )
        }
        throw new Error('Screenshot upload failed: ' + msg)
      }

      // ── Insert participant row into DB
      setStep('saving')
      const { error: insertError } = await sb.from('participants').insert({
        product_id:      product.id,
        name:            form.name.trim(),
        phone:           form.phone.trim(),
        address:         form.address.trim(),
        screenshot_url:  screenshotUrl,
        agreed_to_share: form.agree,
        status:          'pending',
      })

      if (insertError) {
        if (insertError.message.includes('unique') || insertError.message.includes('duplicate')) {
          throw new Error('This phone number has already entered this draw.')
        }
        if (insertError.message.includes('row-level security') || insertError.message.includes('policy')) {
          throw new Error('Database insert blocked. Please run the latest schema.sql.')
        }
        throw new Error(insertError.message)
      }

      // ── Layer 2 continued: Mark this device as entered so they can't re-submit
      if (typeof window !== 'undefined') {
        localStorage.setItem(deviceKey, '1')
      }

      setStep('done')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error. Please try again.'
      setError(msg)
      setStep('idle')
    }
  }

  const submitting = step !== 'idle' && step !== 'done'

  if (step === 'done') {
    return (
      <div className="card-tech p-8 text-center border-2 border-green-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-2xl border border-green-200 flex items-center justify-center text-3xl">✓</div>
        <h3 className="font-display text-xl font-bold text-graphite-700">Entry Submitted!</h3>
        <p className="text-steel-500 mt-2 text-sm leading-relaxed">
          Your entry is pending admin approval.<br />We&apos;ll contact you if you win. Good luck! 🍀
        </p>
        <button onClick={() => router.push('/')} className="btn-tech btn-primary inline-flex mt-5 px-6 py-2.5 text-sm">
          ← Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="card-tech p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="accent-line" />
        <h3 className="font-display font-bold text-graphite-700">
          Enter: <span className="text-blue-600">{product.name}</span>
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
          <input value={form.name} onChange={handleField('name')} placeholder="Your full name" className="input-tech" disabled={submitting} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Phone Number *</label>
          <input value={form.phone} onChange={handleField('phone')} placeholder="+91 98765 43210" type="tel" className="input-tech" disabled={submitting} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Delivery Address *</label>
          <textarea value={form.address} onChange={handleField('address')} rows={3}
            placeholder="Your full delivery address..." className="input-tech resize-none" disabled={submitting} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Subscription Screenshot *</label>
          <label className={`block border-2 border-dashed rounded-lg p-5 text-center transition-colors bg-steel-50
            ${submitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50'}
            ${file ? 'border-green-400 bg-green-50/30' : 'border-steel-200'}`}>
            <div className="text-2xl mb-1.5">{file ? '✅' : '📸'}</div>
            <p className="text-xs text-steel-600 font-semibold">{file ? file.name : 'Click to upload your subscription screenshot'}</p>
            <p className="text-xs text-steel-400 mt-1">JPG, PNG, WebP — max 10MB</p>
            <input type="file" accept="image/*"
              onChange={e => { setFile(e.target.files?.[0] || null); setError('') }}
              className="hidden" disabled={submitting} />
          </label>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-3 bg-steel-50 rounded-lg border border-steel-200 hover:border-blue-300 transition-colors">
          <input type="checkbox" checked={form.agree}
            onChange={e => setForm(s => ({ ...s, agree: e.target.checked }))}
            className="mt-0.5 accent-blue-500 w-4 h-4 flex-shrink-0" disabled={submitting} />
          <span className="text-xs text-steel-500 leading-relaxed">
            I agree to share the product on my social media if I win this lucky draw.
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">⚠</span>
            <p className="text-red-700 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {submitting && (
          <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-blue-700 text-sm font-medium">{stepLabel[step]}</p>
          </div>
        )}
      </div>

      <button onClick={submit} disabled={submitting}
        className="btn-tech btn-accent w-full mt-5 py-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
        {stepLabel[step]}
      </button>
    </div>
  )
}
